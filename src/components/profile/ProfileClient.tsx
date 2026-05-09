'use client';

import React, { useState } from 'react';
import { ChevronRight, CreditCard, Bell, Shield, HelpCircle, Package, MessageSquare, Lock, Info } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

interface MenuItem {
  icon: React.ElementType;
  label: string;
  id: 'orders' | 'notifications' | 'security' | 'help';
}

const menuItems: MenuItem[] = [
  { icon: CreditCard, label: '我的订单', id: 'orders' },
  { icon: Bell, label: '消息通知', id: 'notifications' },
  { icon: Shield, label: '账号安全', id: 'security' },
  { icon: HelpCircle, label: '帮助与反馈', id: 'help' },
];

export function ProfileClient() {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const closeModal = () => setActiveModal(null);

  const renderModalContent = () => {
    switch (activeModal) {
      case 'orders':
        return (
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-2">
              <Package className="text-accent w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-text">暂无订单</h4>
            <p className="text-sm text-text-3">您目前还没有任何咨询订单。完成创业体检后即可购买专家服务。</p>
            <button 
              onClick={closeModal}
              className="mt-4 w-full py-3 bg-accent text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
            >
              我知道了
            </button>
          </div>
        );
      case 'notifications':
        return (
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-2">
              <MessageSquare className="text-accent w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-text">消息中心</h4>
            <p className="text-sm text-text-3">您的消息中心目前是空的。当有新的评估建议或系统公告时，我们会第一时间通知您。</p>
            <button 
              onClick={closeModal}
              className="mt-4 w-full py-3 bg-accent text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
            >
              关闭
            </button>
          </div>
        );
      case 'security':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-surface-2 rounded-2xl border border-border/50">
              <div className="w-10 h-10 rounded-xl bg-green/10 flex items-center justify-center">
                <Lock size={20} className="text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-text">账号状态：安全</p>
                <p className="text-xs text-text-3">已完成基本实名验证</p>
              </div>
            </div>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-4 bg-surface border border-border rounded-xl">
                <span className="text-sm font-medium">修改登录密码</span>
                <ChevronRight size={16} className="text-text-3" />
              </button>
              <button className="w-full flex items-center justify-between p-4 bg-surface border border-border rounded-xl">
                <span className="text-sm font-medium">注销账号</span>
                <ChevronRight size={16} className="text-text-3" />
              </button>
            </div>
          </div>
        );
      case 'help':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-surface-2 rounded-2xl text-center border border-border/50">
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-2">
                  <Info size={16} className="text-accent" />
                </div>
                <p className="text-xs font-bold">常见问题</p>
              </div>
              <div className="p-4 bg-surface-2 rounded-2xl text-center border border-border/50">
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-2">
                  <MessageSquare size={16} className="text-accent" />
                </div>
                <p className="text-xs font-bold">在线客服</p>
              </div>
            </div>
            <div className="p-5 bg-accent/5 rounded-2xl border border-accent/10">
              <h5 className="text-sm font-bold text-accent mb-2">弘业坊创业互助</h5>
              <p className="text-[13px] leading-relaxed text-text-2">
                我们致力于用 AI 赋能创业者。如果您在使用过程中遇到任何问题，或有更好的建议，欢迎随时联系我们。
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="px-6 py-8 space-y-3">
        {menuItems.map((item, i) => (
          <button
            key={i}
            onClick={() => setActiveModal(item.id)}
            className="w-full flex items-center justify-between p-5 bg-surface rounded-2xl border border-border transition-all active:scale-[0.98] hover:border-accent/30"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-surface-2 flex items-center justify-center">
                <item.icon size={20} className="text-text/70" />
              </div>
              <span className="text-[15px] font-bold text-text">{item.label}</span>
            </div>
            <ChevronRight size={18} className="text-text-2" />
          </button>
        ))}
      </div>

      <Modal 
        isOpen={activeModal !== null} 
        onClose={closeModal} 
        title={menuItems.find(i => i.id === activeModal)?.label || ''}
      >
        {renderModalContent()}
      </Modal>
    </>
  );
}
