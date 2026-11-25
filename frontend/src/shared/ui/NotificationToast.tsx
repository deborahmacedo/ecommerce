import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

type NotificationToastProps = {
  type: 'success' | 'error'
  message: string
  onClose: () => void
}

export function NotificationToast({ type, message, onClose }: NotificationToastProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const timeout = window.setTimeout(onClose, 5000)
    return () => window.clearTimeout(timeout)
  }, [message, onClose])

  const isSuccess = type === 'success'

  const toastElement = (
    <aside
      className={`notification-toast ${type}`}
      role={isSuccess ? 'status' : 'alert'}
      aria-live={isSuccess ? 'polite' : 'assertive'}
      style={{
        position: 'fixed',
        top: '28px',
        right: '28px',
        zIndex: 99999,
      }}
    >
      <div className="notification-symbol" aria-hidden="true">
        {isSuccess ? (
          <svg viewBox="0 0 24 24">
            <path d="m5 12 4 4L19 6" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24">
            <path d="M12 7v6M12 17.5v.5" />
          </svg>
        )}
      </div>
      <div className="notification-content">
        <p>{isSuccess ? 'Operação concluída' : 'Não foi possível concluir'}</p>
        <span>{message}</span>
      </div>
      <button type="button" onClick={onClose} aria-label="Fechar notificação">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m7 7 10 10M17 7 7 17" />
        </svg>
      </button>
      <i className="notification-progress" aria-hidden="true" />
    </aside>
  )

  if (mounted && typeof document !== 'undefined') {
    return createPortal(toastElement, document.body)
  }

  return null
}
