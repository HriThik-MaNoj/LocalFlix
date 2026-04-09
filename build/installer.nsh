; Custom NSIS installer script for LocalFlix
; This file adds custom installation logic

!macro preInit
  SetRegView 64
  WriteRegExpandStr HKLM "${INSTALL_REGISTRY_KEY}" InstallLocation "$LocalAppData\LocalFlix"
  WriteRegExpandStr HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation "$LocalAppData\LocalFlix"
  SetRegView 32
  WriteRegExpandStr HKLM "${INSTALL_REGISTRY_KEY}" InstallLocation "$LocalAppData\LocalFlix"
  WriteRegExpandStr HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation "$LocalAppData\LocalFlix"
!macroend

!macro customInstall
  ; Create shortcuts with proper app user model ID
  SetRegView 64
  WriteRegStr HKCU "Software\Classes\AppUserModelId\com.localflix.app" "DisplayName" "LocalFlix"
!macroend
