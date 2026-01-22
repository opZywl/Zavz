#include "pch.h"

#include "config.h"

#include <fstream>
#include <algorithm>
#include <direct.h>

std::string path;

// Config name and state
std::wstring name;
std::wstring value;

// generated Config str
std::wstring configstr;

char working_dir[1024];
bool customProcName = false;
std::wstring delaystr = L"5";
std::wstring dllPath = L"Click \"Select\" to select the dll file";
std::wstring procName = L"javaw.exe";
std::wstring fdpJarPath;
std::wstring jvmArgs;
int injectionMethod = 0;
bool autoCloseAfterInject = false;
bool randomTitle = false;

config::config()
{
    path = working_dir;
    path += "\\config.txt";
}

bool config::loadConfig()
{
    std::wifstream cFile(path);
    if (cFile.is_open())
    {
        std::wstring line;
        while (getline(cFile, line))
        {
            if (line[0] == '#' || line.empty())
                continue;
            size_t delimiterPos = line.find('=');
            name = line.substr(0, delimiterPos);

            value = line.substr(delimiterPos + 1);
            // std::transform(value.begin(), value.end(), value.begin(), [](unsigned char c) { return std::tolower(c); });
            analyseState();
        }
        return false;
    }
    else
    {
        return true;
    }
}

bool config::saveConfig()
{
    std::wofstream create(path);
    if (create.is_open())
    {
        std::wstring configstr = makeConfig();
        create << configstr;
    }
    else
    {
        wxMessageBox("Can't create config file!", "YZY Injector ERROR", wxICON_ERROR);
        // std::cout << "Couldn't create config file on " + path << std::endl;
        return true;
    }
    return false;
}

bool config::analyseBool()
{
    std::transform(value.begin(), value.end(), value.begin(), [](unsigned char c)
                   { return std::tolower(c); });
    if (value == "true" || value == "1")
    {
        std::cout << name << " "
                  << "true" << '\n';
        return true;
    }
    else
    {
        std::cout << name << " "
                  << "false" << '\n';
        return false;
    }
}

int config::analyseInt()
{
    if (std::all_of(value.begin(), value.end(), ::isdigit))
    {
        std::cout << name << " " << value << '\n';
        return std::stoi(value);
    }
    else
    {
        std::cout << name << " Is not parsable \"" << value << "\"\n";
        return 0;
    }
}

std::wstring config::makeConfig()
{

    configstr.clear();
    configstr += L"#YZY Injector config file\n";

    // customProcName
    configstr += customProcName == true ? L"customProcName=true\n" : L"customProcName=false\n";
    // delaystr
    configstr += L"delaystr=" + delaystr + '\n';
    // dllPath
    configstr += L"dllPath=" + dllPath + '\n';
    // procName
    configstr += L"procName=" + procName + '\n';
    // fdpJarPath
    configstr += L"fdpJarPath=" + fdpJarPath + '\n';
    // jvmArgs
    configstr += L"jvmArgs=" + jvmArgs + '\n';
    // injectionMethod
    configstr += L"injectionMethod=" + std::to_wstring(injectionMethod) + '\n';
    // autoCloseAfterInject
    configstr += autoCloseAfterInject == true ? L"autoCloseAfterInject=true\n" : L"autoCloseAfterInject=false\n";
    // randomTitle
    configstr += randomTitle == true ? L"randomTitle=true\n" : L"randomTitle=false\n";

    return configstr;
}

void config::analyseState()
{
    if (name == "customProcName")
    {
        customProcName = analyseBool();
    }
    else if (name == "delaystr")
    {
        delaystr = value;
    }
    else if (name == "dllPath")
    {
        dllPath = value;
    }
    else if (name == "procName")
    {
        procName = value;
    }
    else if (name == "fdpJarPath")
    {
        fdpJarPath = value;
    }
    else if (name == "jvmArgs")
    {
        jvmArgs = value;
    }
    else if (name == "injectionMethod")
    {
        injectionMethod = analyseInt();
    }
    else if (name == "autoCloseAfterInject")
    {
        autoCloseAfterInject = analyseBool();
    }
    else if (name == "randomTitle")
    {
        randomTitle = analyseBool();
    }
    else
    {
        wxMessageBox("\"" + name + "\" Is not a known Entry\nDeleting the config file might help!", "YZY Config WARNING", wxICON_INFORMATION);
    }
}
