export type TemplatePreset = {
    id: string
    label: string
    icon: React.ReactNode
  
}
  
export interface GeneratedName {
    id: string
    name: string
    description: string
    category: string
    isFavorite: boolean
}