#include "pch.h"
#include "cMain.h"
#include"FixFilePerms.h"
#include "inject.h"
#include "cApp.h"
#include "config.h"
#include "icon/icon.xpm"
#include <wx/filefn.h>
#include <wx/filename.h>
#include <wx/stdpaths.h>

wxBEGIN_EVENT_TABLE(cMain, wxFrame)
EVT_BUTTON(101, OnInjectButton)
EVT_BUTTON(102, OnHideButton)
EVT_BUTTON(103, OnSelectButton)
EVT_BUTTON(104, OnSaveJarButton)
EVT_BUTTON(105, OnChangeJarButton)
EVT_BUTTON(106, OnWatchButton)
EVT_BUTTON(107, OnToggleLogButton)

EVT_CHECKBOX(201, OnCustomCheckBox)
EVT_CHECKBOX(203, OnBadlionCheckBox)
EVT_TIMER(301, OnWaitTimer)

wxEND_EVENT_TABLE();


cMain::cMain(bool useFdpLoader) : wxFrame(nullptr, wxID_ANY, "YZY Injector", wxDefaultPosition, wxSize(360, 370), wxMINIMIZE_BOX | wxSYSTEM_MENU | wxCAPTION | wxCLOSE_BOX | wxCLIP_CHILDREN), fdpMode(useFdpLoader) {
    wxIcon icon(icon_xpm); // icons are shit to do but the technike is actually quite nice
    this->SetIcon(icon);
    this->SetBackgroundColour(wxColour(18, 18, 18, 255));

    mainPanel = new wxPanel(this, wxID_ANY);
    mainPanel->SetBackgroundColour(wxColour(18, 18, 18, 255));
	btn_Inject = new wxButton(mainPanel, 101, "Inject", wxPoint(10, 10), wxSize(110, 40));
   	btn_Hide = new wxButton(mainPanel, 102, "Hide Menu", wxPoint(10, 55), wxSize(110, 24));
    btn_Select = new wxButton(mainPanel, 103, "Select DLL", wxPoint(10, 90), wxSize(110, 24));
	txt_Name = new wxTextCtrl(mainPanel, wxID_ANY, "javaw.exe", wxPoint(130, 10), wxSize(200, 22));
	check_Custom = new wxCheckBox(mainPanel, 201, "Custom Target", wxPoint(130, 36), wxSize(200, 20));
    btn_Watch = new wxButton(mainPanel, 106, "Start Watcher", wxPoint(130, 60), wxSize(200, 24));
	txt_Path = new wxTextCtrl(mainPanel, wxID_ANY, "Click \"Select DLL\" to select the dll file", wxPoint(130, 90), wxSize(200, 22));
    label_Wait = new wxStaticText(mainPanel, wxID_ANY, "Waiting for javaw.exe...", wxPoint(10, 125), wxSize(200, 20));
    gauge_Wait = new wxGauge(mainPanel, wxID_ANY, 100, wxPoint(210, 122), wxSize(120, 20));
    label_JvmArgs = new wxStaticText(mainPanel, wxID_ANY, "JVM Args", wxPoint(10, 132), wxSize(120, 16));
    txt_JvmArgs = new wxTextCtrl(mainPanel, wxID_ANY, "", wxPoint(10, 150), wxSize(320, 22));
    label_Method = new wxStaticText(mainPanel, wxID_ANY, "Injection Method", wxPoint(10, 168), wxSize(140, 16));
    choice_Method = new wxChoice(mainPanel, wxID_ANY, wxPoint(10, 186), wxSize(160, 24));
    choice_Method->Append("Standard (LoadLibrary)");
    choice_Method->Append("Manual Map");
    check_AutoClose = new wxCheckBox(mainPanel, wxID_ANY, "Auto-close after inject", wxPoint(180, 188), wxSize(170, 20));
    check_RandomTitle = new wxCheckBox(mainPanel, wxID_ANY, "Random Title", wxPoint(10, 214), wxSize(120, 20));
    btn_ToggleLog = new wxButton(mainPanel, 107, "Show Logs", wxPoint(180, 212), wxSize(150, 24));
    txt_Log = new wxTextCtrl(mainPanel, wxID_ANY, "", wxPoint(10, 242), wxSize(320, 90), wxTE_MULTILINE | wxTE_READONLY);
    btn_SaveJar = new wxButton(mainPanel, 104, "Save", wxPoint(10, 340), wxSize(60, 22));
    btn_ChangeJar = new wxButton(mainPanel, 105, "Change", wxPoint(80, 340), wxSize(70, 22));
    txt_JarPath = new wxTextCtrl(mainPanel, wxID_ANY, "No .jar selected", wxPoint(160, 340), wxSize(170, 45), wxTE_MULTILINE | wxTE_READONLY);
    check_Lunar = new wxCheckBox(mainPanel, wxID_ANY, "Lunar Client", wxPoint(10, 370), wxSize(120, 20));
    check_Badlion = new wxCheckBox(mainPanel, 203, "Badlion Client", wxPoint(140, 370), wxSize(120, 20));
    CreateStatusBar(1);
    SetStatusText("v0.1 made by github.com/opZywl", 0);

    
    check_Custom->SetValue(customProcName);
    txt_Path->SetLabel(dllPath);
    txt_JvmArgs->SetValue(wxString(jvmArgs));
    if (injectionMethod < 0 || injectionMethod > 1) {
        injectionMethod = 0;
    }
    choice_Method->SetSelection(injectionMethod);
    check_AutoClose->SetValue(autoCloseAfterInject);
    check_RandomTitle->SetValue(randomTitle);
    if (customProcName) {
        txt_Name->SetLabel(procName);
    }
    else {
        txt_Name->Disable();
    }
    
    taskBarControl.SetIcon(icon, "Double-Click to show YZY Injector");

    notification = new wxNotificationMessage("YZY Injector", "YZY Injector is now hidden in your system tray", this, 0);
    notification->UseTaskBarIcon(&taskBarControl);
    openDialog = new wxFileDialog(this, "Select the .dll file", working_dir, "YZY.Client.dll" ,"Dynamic link library (*.dll)|*.dll", wxFD_OPEN);
    openJarDialog = new wxFileDialog(this, "Select the .jar file", working_dir, "" ,"Java archive (*.jar)|*.jar", wxFD_OPEN);
    waitTimer = new wxTimer(this, 301);

    if (fdpMode) {
        SetSize(wxSize(360, 430));
        check_Lunar->SetValue(true);
        check_Badlion->SetValue(false);
        if (!SetupFdpLoader()) {
            Close();
            return;
        }
    } else {
        btn_SaveJar->Hide();
        btn_ChangeJar->Hide();
        txt_JarPath->Hide();
        check_Lunar->Hide();
        check_Badlion->Hide();
    }

    wxColour textColour(230, 230, 230);
    wxColour inputColour(30, 30, 30);
    wxColour accent(140, 80, 255);
    mainPanel->SetForegroundColour(textColour);
    SetForegroundColour(textColour);
    txt_Name->SetForegroundColour(textColour);
    txt_Path->SetForegroundColour(textColour);
    txt_JvmArgs->SetForegroundColour(textColour);
    txt_Log->SetForegroundColour(textColour);
    txt_JarPath->SetForegroundColour(textColour);
    txt_Name->SetBackgroundColour(inputColour);
    txt_Path->SetBackgroundColour(inputColour);
    txt_JvmArgs->SetBackgroundColour(inputColour);
    txt_Log->SetBackgroundColour(wxColour(20, 20, 20));
    txt_JarPath->SetBackgroundColour(inputColour);
    label_Wait->SetForegroundColour(textColour);
    label_JvmArgs->SetForegroundColour(textColour);
    label_Method->SetForegroundColour(textColour);
    gauge_Wait->SetForegroundColour(accent);
    check_Custom->SetForegroundColour(textColour);
    check_AutoClose->SetForegroundColour(textColour);
    check_RandomTitle->SetForegroundColour(textColour);
    check_Lunar->SetForegroundColour(textColour);
    check_Badlion->SetForegroundColour(textColour);
    btn_Inject->SetBackgroundColour(accent);
    btn_Inject->SetForegroundColour(wxColour(255, 255, 255));
    btn_Watch->SetBackgroundColour(wxColour(45, 45, 45));
    btn_Watch->SetForegroundColour(textColour);
    btn_ToggleLog->SetBackgroundColour(wxColour(45, 45, 45));
    btn_ToggleLog->SetForegroundColour(textColour);

    txt_Log->Hide();
    if (randomTitle) {
        wxArrayString titles;
        titles.Add("Notepad");
        titles.Add("Calculator");
        titles.Add("Windows Update");
        titles.Add("Audio Service");
        titles.Add("System Settings");
        srand(static_cast<unsigned int>(time(nullptr)));
        SetTitle(titles[rand() % titles.size()]);
    }
}


cMain::~cMain() {
    openDialog->Destroy();
    openJarDialog->Destroy();
    waitTimer->Stop();
    delete waitTimer;
    notification->Close();
    delete(notification);
}


void cMain::OnInjectButton(wxCommandEvent& evt) {

    cMain::OnInjectButtonExecute(evt, this);
}

void cMain::OnInjectButtonExecute(wxCommandEvent& evt, cMain* ref) {
    std::string debug;

    DWORD procId = 0;

    procId = GetProcId(ref->txt_Name->GetValue().mb_str());
    if (ref->txt_Log) {
        ref->txt_Log->AppendText("Checking process...\n");
    }


    if (procId == 0) {

        debug = "Can't find process! | " + std::to_string(procId);
        ref->SetStatusText(debug, 0);
        if (ref->txt_Log) {
            ref->txt_Log->AppendText("Process not found.\n");
        }
        return;
    }
    wxString wxStrPath = ref->txt_Path->GetValue();
    std::wstring wStrPath = wxStrPath.ToStdWstring(); // converting wxstr to wstr
    std::ifstream test(wStrPath.c_str()); // test if file path is valid
    if (!test) {

        debug = "Process found! | " + std::to_string(procId) + " | invalid file path";
        ref->SetStatusText(debug, 0);
        if (ref->txt_Log) {
            ref->txt_Log->AppendText("DLL path invalid.\n");
        }
        return;
    }

    if (ref->choice_Method && ref->choice_Method->GetSelection() == 1) {
        if (ref->txt_Log) {
            ref->txt_Log->AppendText("Manual Map not available yet. Using Standard.\n");
        }
    }

    SetAccessControl(wStrPath, L"S-1-15-2-1");
    performInjection(procId, wStrPath.c_str());
    debug = "Process found! | " + std::to_string(procId) + " | valid file path | Injected!";
    ref->SetStatusText(debug, 0);
    if (ref->txt_Log) {
        ref->txt_Log->AppendText("Injected successfully.\n");
    }


    customProcName = ref->check_Custom->GetValue();
    dllPath = ref->txt_Path->GetValue();
    procName = ref->txt_Name->GetValue();
    jvmArgs = ref->txt_JvmArgs->GetValue().ToStdWstring();
    injectionMethod = ref->choice_Method->GetSelection();
    autoCloseAfterInject = ref->check_AutoClose->GetValue();
    randomTitle = ref->check_RandomTitle->GetValue();
    if (ref->fdpMode && ref->txt_JarPath) {
        fdpJarPath = ref->txt_JarPath->GetValue().ToStdWstring();
    }

    config cfg;
    cfg.saveConfig();

    if (ref->check_AutoClose->GetValue()) {
        ref->Close();
        return;
    }

	evt.Skip();
}


void cMain::OnHideButton(wxCommandEvent& evt) {

    notification->Show();
    this->Hide();

    // YZY Injector is now hidden in system tray
	evt.Skip();
}
void cMain::OnSelectButton(wxCommandEvent& evt) {


    if (openDialog->ShowModal() == wxID_OK) // if the user click "Open" instead of "Cancel"
    {
        txt_Path->SetLabel(openDialog->GetPath());
    }

	evt.Skip();
}

void cMain::OnSaveJarButton(wxCommandEvent& evt) {
    customProcName = check_Custom->GetValue();
    dllPath = txt_Path->GetValue().ToStdWstring();
    procName = txt_Name->GetValue().ToStdWstring();
    fdpJarPath = txt_JarPath->GetValue().ToStdWstring();
    jvmArgs = txt_JvmArgs->GetValue().ToStdWstring();
    injectionMethod = choice_Method->GetSelection();
    autoCloseAfterInject = check_AutoClose->GetValue();
    randomTitle = check_RandomTitle->GetValue();

    config cfg;
    cfg.saveConfig();
    SetStatusText("FDP Loader: Settings saved.", 0);
    evt.Skip();
}

void cMain::OnChangeJarButton(wxCommandEvent& evt) {
    if (openJarDialog->ShowModal() == wxID_OK) {
        wxString jarSrcPath = openJarDialog->GetPath();
        wxString fdpDir = wxGetHomeDir() + "\\.fdpclient";
        wxFileName::Mkdir(fdpDir, wxS_DIR_DEFAULT, wxPATH_MKDIR_FULL);
        wxFileName jarName(jarSrcPath);
        wxString jarDestPath = fdpDir + "\\" + jarName.GetFullName();
        wxFileName srcFile(jarSrcPath);
        wxFileName destFile(jarDestPath);
        srcFile.Normalize();
        destFile.Normalize();
        if (srcFile.GetFullPath() == destFile.GetFullPath() || wxFileExists(jarDestPath)) {
            txt_JarPath->SetValue(jarDestPath);
            fdpJarPath = jarDestPath.ToStdWstring();
            SetStatusText("FDP Loader: .jar already in .fdpclient.", 0);
            evt.Skip();
            return;
        }
        if (!wxCopyFile(jarSrcPath, jarDestPath, true)) {
            wxMessageBox("Couldn't copy the .jar to your .fdpclient folder.", "YZY Injector", wxICON_ERROR);
            evt.Skip();
            return;
        }
        txt_JarPath->SetValue(jarDestPath);
        fdpJarPath = jarDestPath.ToStdWstring();
        SetStatusText("FDP Loader: .jar updated.", 0);
    }

    evt.Skip();
}

void cMain::OnWatchButton(wxCommandEvent& evt) {
    if (watcherActive) {
        watcherActive = false;
        btn_Watch->SetLabel("Start Watcher");
        label_Wait->SetLabel("Watcher stopped.");
        waitTimer->Stop();
        evt.Skip();
        return;
    }

    watcherActive = true;
    btn_Watch->SetLabel("Stop Watcher");
    label_Wait->SetLabel("Waiting for javaw.exe...");
    waitTimer->Start(150);
    std::thread loopthread(&cMain::loopInject, this);
    loopthread.detach();
    evt.Skip();
}

void cMain::OnToggleLogButton(wxCommandEvent& evt) {
    if (txt_Log->IsShown()) {
        txt_Log->Hide();
        btn_ToggleLog->SetLabel("Show Logs");
        Layout();
    } else {
        txt_Log->Show();
        btn_ToggleLog->SetLabel("Hide Logs");
        Layout();
    }
    evt.Skip();
}

void cMain::OnWaitTimer(wxTimerEvent& evt) {
    if (watcherActive && gauge_Wait) {
        gauge_Wait->Pulse();
    }
    evt.Skip();
}

void cMain::OnCustomCheckBox(wxCommandEvent& evt) {


    if (check_Custom->IsChecked()) {
        txt_Name->Enable(true);
    }
    else {
        txt_Name->Enable(false);
        txt_Name->SetLabel("javaw.exe");
    }
    evt.Skip();
}


bool cheapThreadFix = false;

void cMain::OnBadlionCheckBox(wxCommandEvent& evt) {
    if (check_Badlion->IsChecked()) {
        wxMessageBox("Injector in beta disponivel pro badlion em breve.. follow https://github.com/opZywl for new updates and download badlion version.", "YZY Injector", wxICON_INFORMATION);
        check_Badlion->SetValue(false);
        check_Lunar->SetValue(true);
    }
    evt.Skip();
}

void cMain::disableAutoInject() {
    check_Custom->Enable();
    if (check_Custom->IsChecked()) {
        txt_Name->Enable();
    }
    txt_Path->Enable();
    btn_Select->Enable();
}

bool cMain::loopInject() {
    cheapThreadFix = true;
    std::string debug;
    SetStatusText("Watcher: waiting for process...", 0);
    if (txt_Log) {
        txt_Log->AppendText("Watcher started.\n");
    }

    DWORD procId = 0;
    DWORD oldProcId = 0;

    while (watcherActive) {
        while (procId == oldProcId || procId == 0) {
            Sleep(500);
            procId = GetProcId(txt_Name->GetValue().mb_str());
            if (procId == 0) {
                debug = "Watcher: Can't find process! | " + std::to_string(procId);
                SetStatusText(debug, 0);
                if (txt_Log) {
                    txt_Log->AppendText("Waiting for process...\n");
                }
            }
            else if (procId == oldProcId) {
                debug = "Watcher: Already Injected! | " + std::to_string(procId);
                SetStatusText(debug, 0);
            }
            if (!watcherActive) {
                cheapThreadFix = false;
                return false;
            }
        }
        wxString wxStrPath = txt_Path->GetValue();
        std::wstring wStrPath = wxStrPath.ToStdWstring(); // converting wxstr to wstr
        std::ifstream test(wStrPath.c_str()); // test if file path is valid
        if (!test) {
            debug = "Watcher: Process found! | " + std::to_string(procId) + " | invalid file path";
            SetStatusText(debug, 0);
            if (txt_Log) {
                txt_Log->AppendText("DLL path invalid. Watcher stopped.\n");
            }
            watcherActive = false;
            btn_Watch->SetLabel("Start Watcher");
            label_Wait->SetLabel("Watcher stopped.");
            waitTimer->Stop();
            cheapThreadFix = false;
            return true;
        }
        if (choice_Method && choice_Method->GetSelection() == 1) {
            if (txt_Log) {
                txt_Log->AppendText("Manual Map not available yet. Using Standard.\n");
            }
        }
        SetAccessControl(wStrPath, L"S-1-15-2-1");
        performInjection(procId, wStrPath.c_str());
        debug = "Process found! | " + std::to_string(procId) + " | valid file path | Injected!";
        SetStatusText(debug, 0);
        if (txt_Log) {
            txt_Log->AppendText("Injected successfully via watcher.\n");
        }
        oldProcId = procId;

        customProcName = check_Custom->GetValue();
        dllPath = txt_Path->GetValue();
        procName = txt_Name->GetValue();
        jvmArgs = txt_JvmArgs->GetValue().ToStdWstring();
        injectionMethod = choice_Method->GetSelection();
        autoCloseAfterInject = check_AutoClose->GetValue();
        randomTitle = check_RandomTitle->GetValue();
        if (fdpMode && txt_JarPath) {
            fdpJarPath = txt_JarPath->GetValue().ToStdWstring();
        }

        config cfg;
        cfg.saveConfig();

        watcherActive = false;
        btn_Watch->SetLabel("Start Watcher");
        label_Wait->SetLabel("Watcher complete.");
        waitTimer->Stop();
        if (check_AutoClose->GetValue()) {
            Close();
            cheapThreadFix = false;
            return true;
        }
    }
    cheapThreadFix = false;
    return false;
}

bool cMain::SetupFdpLoader() {
    if (!fdpMode) {
        return true;
    }

    if (!fdpJarPath.empty()) {
        wxString existingJar = wxString(fdpJarPath);
        if (wxFileExists(existingJar)) {
            txt_JarPath->SetValue(existingJar);
            return true;
        }
    }

    wxMessageBox("Select the .dll and .jar files for FDP Loader.", "YZY Injector", wxICON_INFORMATION);
    if (openDialog->ShowModal() != wxID_OK) {
        return false;
    }
    txt_Path->SetLabel(openDialog->GetPath());

    if (openJarDialog->ShowModal() != wxID_OK) {
        return false;
    }

    wxString jarSrcPath = openJarDialog->GetPath();
    wxString fdpDir = wxGetHomeDir() + "\\.fdpclient";
    wxFileName::Mkdir(fdpDir, wxS_DIR_DEFAULT, wxPATH_MKDIR_FULL);
    wxFileName jarName(jarSrcPath);
    wxString jarDestPath = fdpDir + "\\" + jarName.GetFullName();
    wxFileName srcFile(jarSrcPath);
    wxFileName destFile(jarDestPath);
    srcFile.Normalize();
    destFile.Normalize();
    if (srcFile.GetFullPath() == destFile.GetFullPath() || wxFileExists(jarDestPath)) {
        txt_JarPath->SetValue(jarDestPath);
        fdpJarPath = jarDestPath.ToStdWstring();
        return true;
    }
    if (!wxCopyFile(jarSrcPath, jarDestPath, true)) {
        wxMessageBox("Couldn't copy the .jar to your .fdpclient folder.", "YZY Injector", wxICON_ERROR);
        return false;
    }
    txt_JarPath->SetValue(jarDestPath);
    fdpJarPath = jarDestPath.ToStdWstring();
    return true;
}
