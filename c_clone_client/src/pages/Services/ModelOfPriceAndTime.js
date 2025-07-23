import "./ModelOfPriceAndTime.css"

const ModelOfPriceAndTime = ({ seconds, UserData, Profile, onClose ,startCall}) => {
  const { name:userName, walletAmount, PhoneNumber } = UserData || {}
  const { name: profileName, pricePerMin, type } = Profile || {}

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  return (
    <div className="mode-btn-backdrop">
      <div className="mode-btn-container">
        <div className="mode-btn-content">
          <div className="mode-btn-header">
            <h5 className="mode-btn-title">Call Information</h5>
            <button type="button" className="mode-btn-close" onClick={onClose} aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="mode-btn-body">
            <div className="mode-btn-user-info">
              <div className="mode-btn-avatar">{userName ? userName[0].toUpperCase() : "U"}</div>
              <div className="mode-btn-details">
                <h6>{userName}</h6>
                <p>{PhoneNumber}</p>
              </div>
            </div>
            <div className="mode-btn-call-details">
              <div className="mode-btn-time-display">
                <span className="mode-btn-minutes">{minutes.toString().padStart(2, "0")}min</span>
                <span className="mode-btn-colon">:</span>
                <span className="mode-btn-seconds">{remainingSeconds.toFixed(0)}Sec</span>
              </div>
              <p className="mode-btn-max-duration">Maximum Call Duration</p>
            </div>
            <div className="mode-btn-provider-info">
              <h6 className="text-uppercase">{profileName}</h6>
              <p>{type}</p>
              <p className="mode-btn-price">₹{pricePerMin}/min</p>
            </div>
            <div className="mode-btn-wallet-info">
              <p>Wallet Balance</p>
              <h5>₹{walletAmount.toFixed(2)}</h5>
            </div>
          </div>
          <div className="mode-btn-footer">
            <button type="button" className="mode-btn mode-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="button" onClick={startCall} className="mode-btn mode-btn-primary">
              Start Call
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModelOfPriceAndTime

