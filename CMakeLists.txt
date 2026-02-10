
cmake_minimum_required(VERSION 3.20)
project(Zavz VERSION 0.1)

set(CMAKE_CXX_STANDARD 17)

set(wxBUILD_SHARED OFF CACHE BOOL "OFF for static library!" FORCE) # force wxWidgets to use static library
mark_as_advanced(wxBUILD_SHARED)

add_executable(Zavz WIN32)
add_subdirectory(src)

SET_TARGET_PROPERTIES(Zavz PROPERTIES LINK_FLAGS "/level='requireAdministrator' /uiAccess='false'") # requireAdministrator

add_subdirectory(wxWidgets-3.2.0)

target_link_libraries(Zavz wx::net wx::core wx::base)

set(CPACK_PROJECT_NAME ${PROJECT_NAME})
set(CPACK_PROJECT_VERSION "v0.1")
