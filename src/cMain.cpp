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

EVT_CHECKBOX(201, OnCustomCheckBox)
EVT_CHECKBOX(202, OnAutoCheckBox)
EVT_CHECKBOX(203, OnBadlionCheckBox)

wxEND_EVENT_TABLE();


cMain::cMain(bool useFdpLoader) : wxFrame(nullptr, wxID_ANY, "YZY Injector", wxDefaultPosition, wxSize(297.5, 162.5), wxMINIMIZE_BOX | wxSYSTEM_MENU | wxCAPTION | wxCLOSE_BOX | wxCLIP_CHILDREN), fdpMode(useFdpLoader) {
    wxIcon icon(icon_xpm); // icons are shit to do but the technike is actually quite nice
    this->SetIcon(icon);
    this->SetBackgroundColour(wxColour(255, 255, 255, 255));

    mainPanel = new wxPanel(this, wxID_ANY);
	btn_Inject = new wxButton(mainPanel, 101, "Inject", wxPoint(5, 5), wxSize(100, 40));
   	btn_Hide = new wxButton(mainPanel, 102, "Hide Menu", wxPoint(5, 50), wxSize(100, 20));
    btn_Select = new wxButton(mainPanel, 103, "Select", wxPoint(5, 75), wxSize(60, 20));
	txt_Name = new wxTextCtrl(mainPanel, wxID_ANY, "javaw.exe", wxPoint(110, 5), wxSize(165, 20));
	check_Custom = new wxCheckBox(mainPanel, 201, "Custom Target", wxPoint(110, 30), wxSize(165, 20));
	check_Auto = new wxCheckBox(mainPanel, 202, "Auto Inject", wxPoint(110, 50), wxSize(130, 20));
	txt_Delay = new wxTextCtrl(mainPanel, wxID_ANY, "5", wxPoint(245, 50), wxSize(30, 20), wxTE_CENTRE, wxTextValidator(wxFILTER_NUMERIC));
    txt_Delay->SetMaxLength(2);
	txt_Path = new wxTextCtrl(mainPanel, wxID_ANY, "Click \"Select\" to select the dll file", wxPoint(70, 75), wxSize(205, 20));
    btn_SaveJar = new wxButton(mainPanel, 104, "Save", wxPoint(5, 100), wxSize(60, 20));
    btn_ChangeJar = new wxButton(mainPanel, 105, "Change", wxPoint(5, 125), wxSize(60, 20));
    txt_JarPath = new wxTextCtrl(mainPanel, wxID_ANY, "No .jar selected", wxPoint(70, 100), wxSize(205, 45), wxTE_MULTILINE | wxTE_READONLY);
    check_Lunar = new wxCheckBox(mainPanel, wxID_ANY, "Lunar Client", wxPoint(70, 150), wxSize(120, 20));
    check_Badlion = new wxCheckBox(mainPanel, 203, "Badlion Client", wxPoint(190, 150), wxSize(120, 20));
    CreateStatusBar(1);
    SetStatusText("v0.1 made by github.com/opZywl", 0);

    
    check_Custom->SetValue(customProcName);
    txt_Delay->SetLabel(delaystr);
    txt_Path->SetLabel(dllPath);
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

    if (fdpMode) {
        SetSize(wxSize(320, 230));
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
}


cMain::~cMain() {
    openDialog->Destroy();
    openJarDialog->Destroy();
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


    if (procId == 0) {

        debug = "Can't find process! | " + std::to_string(procId);
        ref->SetStatusText(debug, 0);
        return;
    }
    wxString wxStrPath = ref->txt_Path->GetValue();
    std::wstring wStrPath = wxStrPath.ToStdWstring(); // converting wxstr to wstr
    std::ifstream test(wStrPath.c_str()); // test if file path is valid
    if (!test) {

        debug = "Process found! | " + std::to_string(procId) + " | invalid file path";
        ref->SetStatusText(debug, 0);
        return;
    }

    SetAccessControl(wStrPath, L"S-1-15-2-1");
    performInjection(procId, wStrPath.c_str());
    debug = "Process found! | " + std::to_string(procId) + " | valid file path | Injected!";
    ref->SetStatusText(debug, 0);


    customProcName = ref->check_Custom->GetValue();
    delaystr = ref->txt_Delay->GetValue();
    dllPath = ref->txt_Path->GetValue();
    procName = ref->txt_Name->GetValue();
    if (ref->fdpMode && ref->txt_JarPath) {
        fdpJarPath = ref->txt_JarPath->GetValue().ToStdWstring();
    }

    config cfg;
    cfg.saveConfig();

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
    dllPath = txt_Path->GetValue().ToStdWstring();
    fdpJarPath = txt_JarPath->GetValue().ToStdWstring();

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

void cMain::OnAutoCheckBox(wxCommandEvent& evt) {
    if (check_Auto->IsChecked()) {
        txt_Name->Disable();
        txt_Path->Disable();
        txt_Delay->Disable();
        btn_Select->Disable();
        check_Custom->Disable();
        if (!cheapThreadFix) {
            std::thread loopthread(&cMain::loopInject, this); // for autoinject
            loopthread.detach();
        }
    }
    else {
        disableAutoInject();
    }

    evt.Skip();
}

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
    txt_Delay->Enable();
    btn_Select->Enable();
}

bool cMain::loopInject() {
    cheapThreadFix = true;
    std::string debug;

    int delay = atoi(txt_Delay->GetValue().mb_str());

    if (delay <= 1) {
        delay = 1;
        txt_Delay->SetLabel("1");
        debug = "AutoInject: Enabled | trying every second";
    }
    else {
        debug = "AutoInject: Enabled | trying every " + std::to_string(delay) + " seconds";
    }
    SetStatusText(debug, 0);


    DWORD procId = 0;
    DWORD oldProcId = 0;

    delay *= 1000;

    while (check_Auto->IsChecked()) {

        while (procId == oldProcId || procId == 0) {
            Sleep(delay);
            procId = GetProcId(txt_Name->GetValue().mb_str());
            if (procId == 0) {
                debug = "AutoInject: Can't find process! | " + std::to_string(procId);
                SetStatusText(debug, 0);
            }
            else if (procId == oldProcId) {
                debug = "AutoInject: Already Injected! | " + std::to_string(procId);
                SetStatusText(debug, 0);
            }
            if (!check_Auto->IsChecked()) {
                cheapThreadFix = false;
                return false;
            }
        }
        wxString wxStrPath = txt_Path->GetValue();
        std::wstring wStrPath = wxStrPath.ToStdWstring(); // converting wxstr to wstr
        std::ifstream test(wStrPath.c_str()); // test if file path is valid
        if (!test) {

            debug = "AutoInject: Process found! | " + std::to_string(procId) + " | invalid file path";
            SetStatusText(debug, 0);
            check_Auto->SetValue(false); // wxWidgets does that automaticly on click so we only need this here
            disableAutoInject();
            cheapThreadFix = false;
            return true;
        }
        SetAccessControl(wStrPath, L"S-1-15-2-1");
        performInjection(procId, wStrPath.c_str());
        debug = "Process found! | " + std::to_string(procId) + " | valid file path | Injected!";
        SetStatusText(debug, 0);
        oldProcId = procId;

        customProcName = ref->check_Custom->GetValue();
        delaystr = ref->txt_Delay->GetValue();
        dllPath = ref->txt_Path->GetValue();
        procName = ref->txt_Name->GetValue();
        if (fdpMode && txt_JarPath) {
            fdpJarPath = txt_JarPath->GetValue().ToStdWstring();
        }

        config cfg;
        cfg.saveConfig();
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
