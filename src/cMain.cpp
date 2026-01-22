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
EVT_CHECKBOX(203, OnBadlionToggle)
EVT_TIMER(301, OnWaitTimer)

wxEND_EVENT_TABLE();


cMain::cMain(bool useFdpLoader) : wxFrame(nullptr, wxID_ANY, "YZY Injector", wxDefaultPosition, wxSize(560, 560), wxMINIMIZE_BOX | wxSYSTEM_MENU | wxCAPTION | wxCLOSE_BOX | wxCLIP_CHILDREN), fdpMode(useFdpLoader) {
    wxIcon icon(icon_xpm); // icons are shit to do but the technike is actually quite nice
    this->SetIcon(icon);
    this->SetBackgroundColour(wxColour(0, 0, 0, 255));

    mainPanel = new wxPanel(this, wxID_ANY);
    mainPanel->SetBackgroundColour(wxColour(0, 0, 0, 255));
	btn_Inject = new wxButton(mainPanel, 101, "Inject");
   	btn_Hide = new wxButton(mainPanel, 102, "Hide Menu");
    btn_Select = new wxButton(mainPanel, 103, "Select DLL");
	txt_Name = new wxTextCtrl(mainPanel, wxID_ANY, "javaw.exe");
	check_Custom = new wxCheckBox(mainPanel, 201, "Custom Target");
    btn_Watch = new wxButton(mainPanel, 106, "Start Watcher");
	txt_Path = new wxTextCtrl(mainPanel, wxID_ANY, "Click \"Select DLL\" to select the dll file");
    label_Wait = new wxStaticText(mainPanel, wxID_ANY, "Waiting for javaw.exe...");
    gauge_Wait = new wxGauge(mainPanel, wxID_ANY, 100);
    label_JvmArgs = new wxStaticText(mainPanel, wxID_ANY, "JVM Args");
    txt_JvmArgs = new wxTextCtrl(mainPanel, wxID_ANY, "");
    label_Method = new wxStaticText(mainPanel, wxID_ANY, "Injection Method");
    choice_Method = new wxChoice(mainPanel, wxID_ANY);
    choice_Method->Append("Standard (LoadLibrary)");
    choice_Method->Append("Manual Map");
    check_AutoClose = new wxCheckBox(mainPanel, wxID_ANY, "Auto-close after inject");
    check_RandomTitle = new wxCheckBox(mainPanel, wxID_ANY, "Random Title");
    btn_ToggleLog = new wxButton(mainPanel, 107, "Show Logs");
    txt_Log = new wxTextCtrl(mainPanel, wxID_ANY, "", wxDefaultPosition, wxDefaultSize, wxTE_MULTILINE | wxTE_READONLY);
    btn_SaveJar = new wxButton(mainPanel, 104, "Save");
    btn_ChangeJar = new wxButton(mainPanel, 105, "Change");
    txt_JarPath = new wxTextCtrl(mainPanel, wxID_ANY, "No .jar selected", wxDefaultPosition, wxDefaultSize, wxTE_MULTILINE | wxTE_READONLY);
    check_Lunar = new wxCheckBox(mainPanel, wxID_ANY, "Lunar Client");
    check_Badlion = new wxCheckBox(mainPanel, 203, "Badlion Client");
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

    wxColour textColour(235, 235, 235);
    wxColour inputColour(24, 24, 24);
    wxColour accent(64, 140, 255);
    wxColour panelBorder(42, 42, 42);
    wxColour buttonDark(40, 40, 40);
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
    txt_Log->SetBackgroundColour(wxColour(16, 16, 16));
    txt_JarPath->SetBackgroundColour(inputColour);
    label_Wait->SetForegroundColour(textColour);
    label_JvmArgs->SetForegroundColour(textColour);
    label_Method->SetForegroundColour(textColour);
    gauge_Wait->SetForegroundColour(wxColour(70, 220, 140));
    check_Custom->SetForegroundColour(textColour);
    check_AutoClose->SetForegroundColour(textColour);
    check_RandomTitle->SetForegroundColour(textColour);
    check_Lunar->SetForegroundColour(textColour);
    check_Badlion->SetForegroundColour(textColour);
    btn_Inject->SetBackgroundColour(accent);
    btn_Inject->SetForegroundColour(wxColour(255, 255, 255));
    btn_Watch->SetBackgroundColour(accent);
    btn_Watch->SetForegroundColour(wxColour(255, 255, 255));
    btn_Hide->SetBackgroundColour(buttonDark);
    btn_Hide->SetForegroundColour(textColour);
    btn_Select->SetBackgroundColour(buttonDark);
    btn_Select->SetForegroundColour(textColour);
    btn_ToggleLog->SetBackgroundColour(buttonDark);
    btn_ToggleLog->SetForegroundColour(textColour);
    btn_SaveJar->SetBackgroundColour(accent);
    btn_SaveJar->SetForegroundColour(wxColour(255, 255, 255));
    btn_ChangeJar->SetBackgroundColour(buttonDark);
    btn_ChangeJar->SetForegroundColour(textColour);
    btn_ToggleLog->SetMinSize(wxSize(-1, 32));

    txt_Log->Hide();
    txt_Name->SetMinSize(wxSize(220, -1));
    txt_Path->SetMinSize(wxSize(280, -1));
    txt_JvmArgs->SetMinSize(wxSize(300, -1));
    txt_Log->SetMinSize(wxSize(-1, 120));
    txt_JarPath->SetMinSize(wxSize(-1, 50));
    gauge_Wait->SetMinSize(wxSize(160, 18));

    wxBoxSizer *mainSizer = new wxBoxSizer(wxVERTICAL);
    wxBoxSizer *topSizer = new wxBoxSizer(wxHORIZONTAL);
    wxBoxSizer *leftButtonsSizer = new wxBoxSizer(wxVERTICAL);
    wxBoxSizer *rightTargetSizer = new wxBoxSizer(wxVERTICAL);

    btn_Inject->SetMinSize(wxSize(120, 42));
    leftButtonsSizer->Add(btn_Inject, 0, wxEXPAND | wxBOTTOM, 8);
    leftButtonsSizer->Add(btn_Hide, 0, wxEXPAND | wxBOTTOM, 8);
    leftButtonsSizer->Add(btn_Select, 0, wxEXPAND);

    wxStaticText *label_Target = new wxStaticText(mainPanel, wxID_ANY, "Target Process");
    label_Target->SetForegroundColour(textColour);
    rightTargetSizer->Add(label_Target, 0, wxBOTTOM, 4);
    rightTargetSizer->Add(txt_Name, 0, wxEXPAND | wxBOTTOM, 6);
    rightTargetSizer->Add(check_Custom, 0, wxBOTTOM, 6);
    rightTargetSizer->Add(btn_Watch, 0, wxEXPAND | wxBOTTOM, 6);
    rightTargetSizer->Add(txt_Path, 0, wxEXPAND);

    topSizer->Add(leftButtonsSizer, 0, wxRIGHT, 12);
    topSizer->Add(rightTargetSizer, 1, wxEXPAND);
    mainSizer->Add(topSizer, 0, wxEXPAND | wxALL, 12);

    wxStaticText *label_Status = new wxStaticText(mainPanel, wxID_ANY, "Watcher Status");
    label_Status->SetForegroundColour(textColour);
    wxBoxSizer *waitSizer = new wxBoxSizer(wxHORIZONTAL);
    waitSizer->Add(label_Wait, 1, wxALIGN_CENTER_VERTICAL | wxRIGHT, 8);
    waitSizer->Add(gauge_Wait, 0, wxALIGN_CENTER_VERTICAL);
    mainSizer->Add(label_Status, 0, wxLEFT | wxRIGHT | wxBOTTOM, 6);
    mainSizer->Add(waitSizer, 0, wxEXPAND | wxLEFT | wxRIGHT | wxBOTTOM, 12);

    wxStaticBoxSizer *advancedSizer = new wxStaticBoxSizer(wxVERTICAL, mainPanel, "Advanced Settings");
    advancedSizer->GetStaticBox()->SetForegroundColour(textColour);
    wxFlexGridSizer *optionSizer = new wxFlexGridSizer(2, 2, 8, 12);
    optionSizer->AddGrowableCol(1, 1);
    optionSizer->Add(label_JvmArgs, 0, wxALIGN_CENTER_VERTICAL);
    optionSizer->Add(txt_JvmArgs, 1, wxEXPAND);
    optionSizer->Add(label_Method, 0, wxALIGN_CENTER_VERTICAL);
    optionSizer->Add(choice_Method, 1, wxEXPAND);
    advancedSizer->Add(optionSizer, 0, wxEXPAND | wxALL, 12);

    wxBoxSizer *toggleSizer = new wxBoxSizer(wxHORIZONTAL);
    toggleSizer->Add(check_AutoClose, 0, wxRIGHT, 12);
    toggleSizer->Add(check_RandomTitle, 0, wxRIGHT, 12);
    advancedSizer->Add(toggleSizer, 0, wxLEFT | wxRIGHT | wxBOTTOM, 12);
    mainSizer->Add(advancedSizer, 0, wxEXPAND | wxLEFT | wxRIGHT | wxBOTTOM, 12);

    mainSizer->Add(btn_ToggleLog, 0, wxEXPAND | wxLEFT | wxRIGHT | wxBOTTOM, 12);
    mainSizer->Add(txt_Log, 0, wxEXPAND | wxLEFT | wxRIGHT | wxBOTTOM, 12);

    wxStaticBoxSizer *fdpSizer = new wxStaticBoxSizer(wxVERTICAL, mainPanel, "FDP Loader");
    fdpSizer->GetStaticBox()->SetForegroundColour(textColour);
    wxBoxSizer *fdpControlsSizer = new wxBoxSizer(wxHORIZONTAL);
    fdpControlsSizer->Add(btn_SaveJar, 0, wxRIGHT, 8);
    fdpControlsSizer->Add(btn_ChangeJar, 0);
    fdpControlsSizer->AddStretchSpacer();
    fdpSizer->Add(fdpControlsSizer, 0, wxEXPAND | wxBOTTOM, 6);
    fdpSizer->Add(txt_JarPath, 0, wxEXPAND | wxBOTTOM, 6);
    wxBoxSizer *clientSizer = new wxBoxSizer(wxHORIZONTAL);
    clientSizer->Add(check_Lunar, 0, wxRIGHT, 12);
    clientSizer->Add(check_Badlion, 0);
    fdpSizer->Add(clientSizer, 0, wxEXPAND);
    mainSizer->Add(fdpSizer, 0, wxEXPAND | wxLEFT | wxRIGHT | wxBOTTOM, 12);

    if (fdpMode) {
        check_Lunar->SetValue(true);
        check_Badlion->SetValue(false);
        if (!SetupFdpLoader()) {
            Close();
            return;
        }
    } else {
        fdpSizer->Show(false);
    }

    mainPanel->SetSizer(mainSizer);
    mainPanel->Layout();
    mainSizer->Fit(this);
    SetMinSize(wxSize(520, fdpMode ? 560 : 460));
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
        gauge_Wait->SetValue(0);
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
        mainPanel->Layout();
        if (mainPanel->GetSizer()) {
            mainPanel->GetSizer()->Fit(this);
        }
    } else {
        txt_Log->Show();
        btn_ToggleLog->SetLabel("Hide Logs");
        mainPanel->Layout();
        if (mainPanel->GetSizer()) {
            mainPanel->GetSizer()->Fit(this);
        }
    }
    evt.Skip();
}

void cMain::OnWaitTimer(wxTimerEvent& evt) {
    if (gauge_Wait) {
        if (watcherActive) {
            gauge_Wait->Pulse();
        } else {
            gauge_Wait->SetValue(0);
        }
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

void cMain::OnBadlionToggle(wxCommandEvent& evt) {
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
