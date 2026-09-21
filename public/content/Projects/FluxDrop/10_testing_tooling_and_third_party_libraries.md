# Module 10: Third-Party Libraries, CMake & Testing Guide

## 1. Master Third-Party Library Catalog

FluxDrop integrates a curated selection of industry-standard libraries. Every library was selected to fulfill a critical architectural need with zero unnecessary bloat:

| Library | Distribution | Primary Role | Why Selected? |
|---|---|---|---|
| **Boost.Asio** | C++ Template / Compiled | Core Networking & Sockets | De-facto standard C++ networking library; portable across Linux, Windows, macOS, Android; supports non-blocking TCP/UDP and multicast. |
| **libsodium** | C Shared / Static Library | Cryptography | Misuse-resistant, high-speed BLAKE2b hashing (`crypto_generichash`) and hardware CSPRNG (`randombytes_uniform`). |
| **nlohmann/json** | Header-Only C++ | Protocol Metadata Serialization | Expressive, intuitive syntax with `NLOHMANN_DEFINE_TYPE_NON_INTRUSIVE` eliminating manual parsing boilerplate. |
| **GoogleTest** | C++ Static Library (CMake `FetchContent`) | Automated Unit Testing Suite | Comprehensive test runner, rich assertion library (`EXPECT_EQ`, `EXPECT_TRUE`), used across Google and open source. |
| **fluxdrop_logger** | Internal C++ Module | Diagnostics & Cross-Platform Logging | Thread-safe, microsecond-timestamped logging with automatic Android Logcat bridge. |
| **Threads::Threads** | OS Native | Threading Model | Portable wrapper mapping to POSIX `pthreads` on Linux/Android and native threads on Windows. |

---

## 2. CMake Build System Dissection

The build configuration in [Engine/CMakeLists.txt](https://github.com/SawanTeja/FluxDrop/blob/main/Engine/CMakeLists.txt) configures the static library and test targets:

```cmake
cmake_minimum_required(VERSION 3.10)
project(FluxDropEngine)

# 1. Enforce Modern C++20 Standard
set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED True)

# 2. Include Directories
include_directories(include)

# 3. Locate External Dependencies
find_package(Boost REQUIRED)
find_package(Threads REQUIRED)
find_package(PkgConfig REQUIRED)
find_package(nlohmann_json REQUIRED)
pkg_check_modules(SODIUM REQUIRED libsodium)

# 4. Link Logging Sub-module
add_subdirectory(../Logger logger)

# 5. Core Engine Static Library
add_library(fluxdrop_core STATIC
    src/networking.cpp
    src/transfer.cpp
    src/packet.cpp
    src/security.cpp
    src/session.cpp
    src/core_api.cpp
)

target_include_directories(fluxdrop_core PUBLIC
    include
    ${Boost_INCLUDE_DIRS}
    ${SODIUM_INCLUDE_DIRS}
)

target_link_libraries(fluxdrop_core PUBLIC
    fluxdrop_logger
    Threads::Threads
    nlohmann_json::nlohmann_json
    ${Boost_LIBRARIES}
    ${SODIUM_LIBRARIES}
)

# 6. Windows-Specific OS Networking Libraries
if (WIN32)
    target_link_libraries(fluxdrop_core PUBLIC ws2_32 mswsock bcrypt iphlpapi)
endif()

# 7. Automated GoogleTest Setup via FetchContent
include(CTest)
enable_testing()

if(BUILD_TESTING)
    include(FetchContent)
    FetchContent_Declare(
      googletest
      GIT_REPOSITORY https://github.com/google/googletest.git
      GIT_TAG release-1.12.1
    )
    set(gtest_force_shared_crt ON CACHE BOOL "" FORCE)
    FetchContent_MakeAvailable(googletest)

    add_subdirectory(tests)
endif()
```

### Key CMake Decisions Explained
- `FetchContent_Declare(googletest ...)`: Developers don't need to manually install GoogleTest on their machines; CMake downloads and compiles `release-1.12.1` automatically during the build.
- `gtest_force_shared_crt ON`: Avoids runtime library mismatch errors (`MT` vs `MD`) on Windows MSVC.
- `ws2_32 mswsock bcrypt iphlpapi`: Links Windows socket extensions, cryptographic RNG (`bcrypt.lib`), and IP Helper (`iphlpapi.lib`).

---

## 3. The Logging Subsystem (`fluxdrop_logger`)

Diagnostics are critical when debugging wireless network transfers. The internal logging module in [Logger/include/logger.hpp](https://github.com/SawanTeja/FluxDrop/blob/main/Logger/include/logger.hpp) provides zero-cost logging:

### Log Levels
```cpp
namespace fluxdrop::logger {
    enum class Level { DEBUG, INFO, WARN, ERR };
}
```

### Compile-Time Disabling
When building in Release mode (`NDEBUG`), logging is disabled at compile time unless `FLUXDROP_DEBUG` is explicitly set:
```cpp
#if !defined(NDEBUG) || defined(FLUXDROP_DEBUG)
#define FD_LOGGER_ENABLED 1
#else
#define FD_LOGGER_ENABLED 0
#endif
```
When disabled, macros expand to empty `do {} while(0)` blocks, incurring zero runtime CPU overhead.

### Android Logcat Redirection
In [Logger/src/logger.cpp](https://github.com/SawanTeja/FluxDrop/blob/main/Logger/src/logger.cpp#L59-L76), when compiled for Android (`#ifdef __ANDROID__`), logs are automatically routed into the Android system Logcat:
```cpp
#ifdef __ANDROID__
__android_log_print(android_level, "FluxDropCore", "[%s:%d] %s", file_basename(file), line, msg.c_str());
#else
fprintf(stderr, "[FD %s] [%s] [%s:%d] %s\n", timestamp().c_str(), level_to_string(level), file_basename(file), line, msg.c_str());
#endif
```

---

## 4. GoogleTest Unit Testing Suite

The unit testing suite in `Engine/tests/` verifies core invariants of protocol serialization, cryptography, and JSON metadata parsing.

### 1. `test_packet.cpp`: Packet Header Verification
In [Engine/tests/test_packet.cpp](https://github.com/SawanTeja/FluxDrop/blob/main/Engine/tests/test_packet.cpp):
```cpp
TEST(PacketTest, SerializeDeserializeHeader) {
    protocol::PacketHeader header;
    header.command = static_cast<uint32_t>(protocol::CommandType::FILE_META);
    header.payload_size = 1024;
    header.session_id = 42;
    header.reserved = 0;

    auto buffer = protocol::serialize_header(header);
    protocol::PacketHeader decoded = protocol::deserialize_header(buffer);

    EXPECT_EQ(decoded.command, header.command);
    EXPECT_EQ(decoded.payload_size, header.payload_size);
    EXPECT_EQ(decoded.session_id, header.session_id);
    EXPECT_EQ(decoded.reserved, header.reserved);
}

TEST(PacketTest, SerializeDeserializeMaxValues) {
    // Tests 0xFFFFFFFF boundaries across 32-bit fields
}
```

### 2. `test_security.cpp`: Cryptographic Verification
In [Engine/tests/test_security.cpp](https://github.com/SawanTeja/FluxDrop/blob/main/Engine/tests/test_security.cpp):
```cpp
TEST(SecurityTest, GeneratePinBounds) {
    // Verifies 100 consecutive PINs stay strictly between 1000 and 9999
    for (int i = 0; i < 100; ++i) {
        uint16_t pin = security::generate_pin();
        EXPECT_GE(pin, 1000);
        EXPECT_LE(pin, 9999);
    }
}

TEST(SecurityTest, HashConsistency) {
    // Verifies deterministic hashing
    EXPECT_EQ(security::hash_pin("1234"), security::hash_pin("1234"));
    EXPECT_NE(security::hash_pin("1234"), security::hash_pin("1235"));
}

TEST(SecurityTest, VerifyPin) {
    std::string pin = "9999";
    std::string expected_hash = security::hash_pin(pin);
    EXPECT_TRUE(security::verify_pin(pin, expected_hash));
    EXPECT_FALSE(security::verify_pin("1111", expected_hash));
    EXPECT_FALSE(security::verify_pin("", expected_hash));
}
```

### 3. `test_transfer.cpp`: JSON Metadata & Exploit Payloads
In [Engine/tests/test_transfer.cpp](https://github.com/SawanTeja/FluxDrop/blob/main/Engine/tests/test_transfer.cpp):
```cpp
TEST(TransferTest, FileInfoSpecialCharacters) {
    // Tests Unicode emojis, whitespaces, path traversal patterns, and 64-bit max file size
    protocol::FileInfo info{"../../etc/passwd \n \t 🚀", 0xFFFFFFFFFFFFFFFF, "application/octet-stream"};
    nlohmann::json j = info;

    protocol::FileInfo decoded = j.get<protocol::FileInfo>();
    EXPECT_EQ(decoded.filename, "../../etc/passwd \n \t 🚀");
    EXPECT_EQ(decoded.size, 0xFFFFFFFFFFFFFFFF);
    EXPECT_EQ(decoded.mime, "application/octet-stream");
}
```

---

## 5. How to Build and Run Tests

To compile and execute the test suite:

```bash
# 1. Navigate to Engine directory
cd /home/sawan/Tejashvi/FluxDrop/Engine

# 2. Create build directory
mkdir -p build && cd build

# 3. Configure with CMake
cmake -DBUILD_TESTING=ON ..

# 4. Compile core library and test executable
cmake --build . -j$(nproc)

# 5. Run tests via CTest
ctest --output-on-failure
```

Or run the test binary directly:
```bash
./tests/fluxdrop_tests
```

Expected Output:
```
[==========] Running 6 tests from 3 test suites.
[----------] Global test environment set-up.
[----------] 3 tests from PacketTest
[ RUN      ] PacketTest.SerializeDeserializeHeader
[       OK ] PacketTest.SerializeDeserializeHeader (0 ms)
[ RUN      ] PacketTest.SerializeDeserializeMaxValues
[       OK ] PacketTest.SerializeDeserializeMaxValues (0 ms)
[ RUN      ] PacketTest.SerializeDeserializeZeros
[       OK ] PacketTest.SerializeDeserializeZeros (0 ms)
[----------] 4 tests from SecurityTest
[ RUN      ] SecurityTest.GeneratePinBounds
[       OK ] SecurityTest.GeneratePinBounds (1 ms)
[ RUN      ] SecurityTest.HashConsistency
[       OK ] SecurityTest.HashConsistency (0 ms)
[ RUN      ] SecurityTest.HashDifference
[       OK ] SecurityTest.HashDifference (0 ms)
[ RUN      ] SecurityTest.VerifyPin
[       OK ] SecurityTest.VerifyPin (0 ms)
[----------] 3 tests from TransferTest
[ RUN      ] TransferTest.FileInfoJsonSerialization
[       OK ] TransferTest.FileInfoJsonSerialization (0 ms)
[ RUN      ] TransferTest.FileInfoEdgeCases
[       OK ] TransferTest.FileInfoEdgeCases (0 ms)
[ RUN      ] TransferTest.FileInfoSpecialCharacters
[       OK ] TransferTest.FileInfoSpecialCharacters (0 ms)
[----------] Global test environment tear-down
[==========] 10 tests from 3 test suites ran. (1 ms total)
[  PASSED  ] 10 tests.
```

---

## Conclusion & Next Steps

You have now completed the entire **FluxDrop Engine Study Guide**! 

You understand:
1. The layered architecture and component responsibilities.
2. The stable C ABI interface and how frontends integrate via FFI.
3. The 16-byte binary wire protocol, endianness conversions, and path sanitization.
4. Cryptographic PIN generation and BLAKE2b hashing with libsodium.
5. Boost.Asio stream sockets, socket tuning (`TCP_NODELAY`, keepalives), and interface resolution.
6. The hybrid 3-tier UDP broadcast/multicast and gateway unicast discovery engine.
7. 64KB streaming pipelines, 64-bit resume offset encoding, and atomic `.fluxpart` renaming.
8. The symmetrical bidirectional message loop and concurrent send queues.
9. Multi-threaded concurrency, atomic state flags, and thread-safe cancellation.
10. The CMake build system, logging subsystem, and GoogleTest suite.
