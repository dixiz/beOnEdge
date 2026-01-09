import React from 'react';
import './Menu.css';

const ODA_LINK = 'http://be-on-edge.oda.digital/';
const DONATE_LINK = 'https://www.donationalerts.com/r/be_on_edge';

const DonationButtons: React.FC = () => {
  return (
    <div className="donation-buttons" aria-label="Donation links">
      <a
        className="donation-button donation-button--oda"
        href={ODA_LINK}
        target="_blank"
        rel="noreferrer noopener"
      >
        ODA
      </a>
      <a
        className="donation-button donation-button--da"
        href={DONATE_LINK}
        target="_blank"
        rel="noreferrer noopener"
      >
        Donation Alerts
      </a>
    </div>
  );
};

export default React.memo(DonationButtons);

