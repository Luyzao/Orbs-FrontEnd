'use client'

import { useState, useRef, useEffect } from 'react'
import { MdMenuBook, MdOutlineCalculate, MdOutlineQrCode } from 'react-icons/md'
import { TbPigMoney } from 'react-icons/tb'
import { RxExit } from 'react-icons/rx'
import { GiMoonOrbit } from 'react-icons/gi'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { FaWpforms } from 'react-icons/fa6'

export default function SideBar() {
  const [itemSelecionado, setItemSelecionado] = useState('Dashboard')
  const [colapsado, setColapsado] = useState(false)
  const refs = useRef<any>([])
  const router = useRouter()
  const { logout } = useAuth()

  const menuItens = [
    { nome: 'Dashboard', icone: <MdOutlineQrCode size={25} />, path: '/' },
    { nome: 'Educação', icone: <MdMenuBook size={25} />, path: '/education' },
    { nome: 'Metas', icone: <TbPigMoney size={25} />, path: '/metas' },
    {
      nome: 'Calculadora',
      icone: <MdOutlineCalculate size={25} />,
      path: '/calculator',
    },
    { nome: 'Formulário', icone: <FaWpforms size={25} />, path: '/forms' },
  ]

  const handleLogout = () => {
    logout() // limpa sessão / remove user do contexto
    router.push('/auth/login') // redireciona para login
  }

  useEffect(() => {
    const handleResize = () => {
      setColapsado(window.innerWidth <= 1596)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const pathNext = (path: string) => {
    router.push(path)
  }

  if (colapsado) {
    // Mobile: toolbar no topo
    return (
      <div className="fixed top-0 left-0 w-full h-16 bg-gray-100 shadow-md flex items-center justify-between px-4 z-50">
        <div className="text-3xl text-gray-800">
          <GiMoonOrbit />
        </div>
        <div className="flex gap-4">
          {menuItens.map((item, index) => (
            <button
              key={item.nome}
              ref={(el) => {
                refs.current[index] = el
              }}
              onClick={() => {
                setItemSelecionado(item.nome)
                pathNext(item.path)
              }}
              className={`flex px-2 py-1 cursor-pointer
                ${itemSelecionado === item.nome ? 'text-blue-900 bg-indigo-100 border-round-xl' : 'text-gray-800'}`}
            >
              {item.icone}
            </button>
          ))}
        </div>
        <button className="text-gray-800 hover:text-red-500 transition-all">
          <RxExit />
        </button>
      </div>
    )
  }

  // Desktop: sidebar à esquerda
  return (
    <div className="bg-gray-100 xl:w-48 px-2 pb-4 pt-6 shadow-xl h-screen flex flex-col items-center justify-between transition-all">
      <div className="flex flex-col items-center gap-5">
        <div className="text-5xl text-gray-800 mb-4 md:hidden xl:block">
          Orbs
        </div>

        <ul className="text-xl flex flex-col gap-3 z-10">
          {menuItens.map((item, index) => (
            <li
              key={item.nome}
              ref={(el) => {
                refs.current[index] = el
              }}
              onClick={() => {
                setItemSelecionado(item.nome)
                pathNext(item.path)
              }}
              className={`flex gap-2 px-3 py-1 cursor-pointer
                                ${itemSelecionado === item.nome ? 'text-blue-900 bg-indigo-100 border-round-xl' : 'text-gray-800'}`}
            >
              <i>{item.icone}</i>
              <p className="hidden xl:block">{item.nome}</p>
            </li>
          ))}
        </ul>
      </div>

      <button
        className="text-gray-800 flex items-center gap-2 text-xl hover:bg-gray-300 px-3 py-1 rounded-xl transition-all"
        onClick={handleLogout}
      >
        <i>
          <RxExit />
        </i>
        <p className="hidden xl:block">Sair</p>
      </button>
    </div>
  )
}
