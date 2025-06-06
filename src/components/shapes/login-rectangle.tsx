import React, { useEffect, useRef, useState } from 'react'
import { InputText } from 'primereact/inputtext'
import { supabase } from 'lib/supabaseClient'
import Link from 'next/link'

interface LoginRectangleProps {
  className?: string
}

const LoginRectangle: React.FC<LoginRectangleProps> = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [emailError, setEmailError] = useState(false)
  const [passwordError, setPasswordError] = useState(false)
  const toast = useRef<any>(null)
  
  const showSuccess = () => {
    toast.current.show({
      severity: 'success',
      summary: 'Sucesso',
      detail: 'Cadastrado com sucesso',
      life: 3000,
    })
  }

  const showLoginSucess = () => {
    toast.current.show({
      severity: 'success',
      summary: 'Sucesso',
      detail: 'Login bem-sucedido',
      life: 3000,
    })
  }

  const validateForm = () => {
    const noWhiteSpace = (str: string) => str.trim() === str && str !== ''

    const emailValid =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && noWhiteSpace(email)
    const passwordValid = noWhiteSpace(password)

    setEmailError(!emailValid)
    setPasswordError(!passwordValid)

    return emailValid && passwordValid
  }

  const checkUserInForms = async (userId: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('Forms')
      .select('id')
      .eq('userId', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Erro ao buscar no Forms:', error)
      throw error
    }

    return !!data
  }

  const handleLogin = async () => {
    if (validateForm()) {
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        })

        if (error) {
          alert('Erro ao fazer login: ' + error.message)
        } else {
          showLoginSucess()
          const {
            data: { user },
          } = await supabase.auth.getUser()

          if (user) {
            const exists = await checkUserInForms(user.id)

            if (exists) {
              window.location.href = '/'
            } else {
              window.location.href = '/forms'
            }
          }
        }
      } catch (error) {
        console.error(error)
        alert('Erro desconhecido ao tentar fazer login.')
      }
    }
  }

  useEffect(() => {
    async function checkAndInsertUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      // Verifica se já existe na tabela User
      const { data: existingUser, error } = await supabase
        .from('User')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar usuário', error)
        return
      }

      if (!existingUser) {
        const { error: insertError } = await supabase.from('User').insert({
          id: user.id,
          name: user.user_metadata.full_name || 'Usuário',
        })

        if (insertError) {
          console.error('Erro ao inserir usuário', insertError)
        } else {
          showSuccess()
        }
      }
    }

    checkAndInsertUser()
  }, [])

  return (
    <div
      className="h-screen flex justify-center items-center bg-cover bg-center"
      style={{
        backgroundImage: 'url(/images/background-login.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div
        className="bg-[#E0E0E0] bg-opacity-10 backdrop-blur-sm p-6 lg:p-7 xl:p-8 rounded-[35px] shadow-lg border-1 border-[#E0E0E0] w-[320px] 
      sm:w-[400px] md:w-[460px] lg:w-[560px] h-[610px] sm:h-[600px] md:h-[600px] lg:h-[700px]"
      >
        <h2 className="font-comfortaa text-[30px] md:text-[35px] text-center text-[#D9D9D9]">
          {' '}
          Orbs{' '}
        </h2>

        <h5
          className="font-comfortaa text-[20px] md:text-[24px] lg:text-[28px] 2xl:text-[30px] text-center flex justify-center items-center text-[#D9D9D9] 
      mt-7 md:mt-6 lg:mt-7 mx-auto"
        >
          Bem-vindo <br /> de volta!{' '}
        </h5>

        <div className="flex flex-col items-center">
          <div className="flex flex-col relative mb-2">
            <InputText
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-[220px] h-[32px] bg-[#EDEDED] mt-3 text-[#000000] font-comfortaa text-[10px] rounded-[8px] placeholder-black py-1 px-2 
              sm:text-[11px] sm:w-[220px] sm:h-[35px] md:w-[240px] lg:w-[260px] xl:text-[12px] focus:outline-none focus:ring-0 focus:border-transparent"
              placeholder="E-mail"
            />
            {emailError && (
              <small className="p-error text-[10px] mt-0.5 absolute top-[100%] left-0 text-[#FF6961]">
                Campo inválido!
              </small>
            )}
          </div>

          <div className="flex flex-col relative mb-2 w-[220px] sm:w-[220px] md:w-[240px] lg:w-[260px]">
            <InputText
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-[32px] bg-[#EDEDED] mt-3 text-[#000000] font-comfortaa text-[10px] rounded-[8px] placeholder-black py-1 px-2 
              sm:text-[11px] sm:h-[35px] xl:text-[12px] focus:outline-none focus:ring-0 focus:border-transparent w-full"
              placeholder="Senha"
            />

            <div className="flex justify-between items-center mt-1">
              {passwordError ? (
                <small className="text-[#FF6961] text-[10px] font-normal">
                  Campo inválido!
                </small>
              ) : (
                <span className="text-[10px] invisible">placeholder</span>
              )}

              <Link
                href="/auth/reset"
                className="text-[#FFFFFF] font-poppins font-light text-[10px] underline sm:text-[11px]"
              >
                Esqueceu a senha?
              </Link>
            </div>
          </div>

          <div className="flex text-[#FFFFFF] font-poppins font-light text-[0.65rem] mt-3 sm:text-[0.7rem] 2xl:text-[0.75rem]">
            <p>Não tem uma conta?</p>
            <Link href="/auth/signup" className="px-1">
              <span className="text-[#FFFFFF] underline">Cadastre-se</span>
            </Link>
          </div>

          <button
            onClick={handleLogin}
            className="w-[210px] h-[32px] bg-[#252436] font-poppins text-[14px] py-1 mt-3 flex items-center 
            justify-center rounded-lg sm:h-[35px] md:text-[16px] md:w-[230px] lg:w-[250px] lg:text-[16px] xl:text-[17px]"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  )
}

export default LoginRectangle
