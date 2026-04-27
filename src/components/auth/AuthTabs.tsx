'use client'

import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'

export function AuthTabs() {
  const [activeTab, setActiveTab] = useState('login')

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList>
        <TabsTrigger value="login" activeValue={activeTab} onClick={() => setActiveTab('login')}>登录</TabsTrigger>
        <TabsTrigger value="register" activeValue={activeTab} onClick={() => setActiveTab('register')}>注册</TabsTrigger>
      </TabsList>
      <TabsContent value="login" activeValue={activeTab}><LoginForm /></TabsContent>
      <TabsContent value="register" activeValue={activeTab}><RegisterForm /></TabsContent>
    </Tabs>
  )
}
