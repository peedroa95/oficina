import './globals.css';import type {Metadata} from 'next';import {Toaster} from 'sonner';
export const metadata:Metadata={title:'Oficina Fácil',description:'Gestão simples para oficinas mecânicas'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="pt-BR"><body>{children}<Toaster richColors position="top-right"/></body></html>}
