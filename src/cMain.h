#pragma once
#include "taskBarIcon.h"

class cMain : public wxFrame
{
public:
	cMain(bool useFdpLoader);
	~cMain();

public:
	wxPanel *mainPanel = nullptr;
	wxButton *btn_Inject = nullptr;
	wxButton *btn_Hide = nullptr;
	wxButton *btn_Select = nullptr;
	wxButton *btn_SaveJar = nullptr;
	wxButton *btn_ChangeJar = nullptr;
	wxTextCtrl *txt_Name = nullptr;
	wxTextCtrl *txt_Delay = nullptr;
	wxTextCtrl *txt_Path = nullptr;
	wxTextCtrl *txt_JarPath = nullptr;
	wxBoxSizer *sizer = nullptr;
	wxCheckBox *check_Custom = nullptr;
	wxCheckBox *check_Auto = nullptr;
	wxCheckBox *check_Lunar = nullptr;
	wxCheckBox *check_Badlion = nullptr;

	wxFileDialog *openDialog = nullptr;
	wxFileDialog *openJarDialog = nullptr;
	taskBarIcon taskBarControl;
	wxNotificationMessage *notification = nullptr;

public:
	static void OnInjectButtonExecute(wxCommandEvent &evt, cMain *ref);
	void OnInjectButton(wxCommandEvent &evt);
	void OnHideButton(wxCommandEvent &evt);
	void OnSelectButton(wxCommandEvent &evt);
	void OnSaveJarButton(wxCommandEvent &evt);
	void OnChangeJarButton(wxCommandEvent &evt);

	void OnCustomCheckBox(wxCommandEvent &evt);
	void OnAutoCheckBox(wxCommandEvent &evt);
	void OnBadlionCheckBox(wxCommandEvent &evt);

	void onTaskBarDClick(wxCommandEvent &evt);

	wxDECLARE_EVENT_TABLE();

public:
	bool loopInject();
	void disableAutoInject();
	bool SetupFdpLoader();
	friend taskBarIcon::taskBarIcon();

private:
	bool fdpMode = false;
};
