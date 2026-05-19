import { I } from './icons'

function Toast({ text, kind = 'success' }) {
  return (
    <div className="toast-stack">
      <div className={`toast ${kind === 'error' ? 'error' : ''}`}>
        {kind === 'error' ? <I.X size={14} /> : <I.Check size={14} />}
        {text}
      </div>
    </div>
  )
}

export default Toast
