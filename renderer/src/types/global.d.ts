export interface ElectronAPI {
  saveData: (data: any) => Promise<void>
  loadData: () => Promise<any>
  minimize: () => Promise<void>
  maximize: () => Promise<void>
  close: () => Promise<void>
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

export {} 