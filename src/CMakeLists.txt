target_sources(yzyInjector PRIVATE cApp.cpp        
cMain.cpp       
config.cpp      
FixFilePerms.cpp
inject.cpp
pch.cpp
taskBarIcon.cpp
icon.rc)

target_precompile_headers(yzyInjector PRIVATE "pch.h")
