export default function HighlightMenu({ position, label, onAction }) {
  if (!position) return null
  const style = {
    position: 'absolute',
    top: position.top,
    left: position.left,
    background: 'white',
    border: '1px solid #ccc',
    padding: '4px',
    zIndex: 1000,
  }
  return (
    <div style={style} className="highlight-menu">
      <button onClick={onAction}>{label}</button>
    </div>
  )
}
