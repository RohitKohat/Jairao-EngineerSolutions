import PropTypes from 'prop-types';
import './SolarProposal.css';

const materialData = (panelQty) => [
  { sno: '1)', description: 'Solar Panel', specification: 'MONO-PERC HALF CUT DCR BIFACIAL PANELS 565/575Wp', make: 'Adani/Waaree/Prime/Loom', uom: 'Nos.', qty: panelQty },
  { sno: '2)', description: 'Grid Tied inverter', specification: 'Grid Tied Inverter, 1 Phase, with Wi-Fi Monitoring system', make: 'POLYCAB/GROWAT', uom: 'Nos.', qty: '1' },
  { sno: '3)', description: 'Mounting structure', specification: 'Panels shall be mounted on Galvanized structures.', make: 'G.I', uom: 'Set', qty: '1' },
  { sno: '4)', description: 'ACDB', specification: 'GSL Make', make: 'ABB/L&T', uom: 'Set', qty: '1' },
  { sno: '5)', description: 'DCDB', specification: 'GSL Make', make: 'Mersen Fuse & SPD', uom: 'Set', qty: '1' },
  { sno: '6)', description: 'AC Cable', specification: 'Copper Cable', make: 'KEI/Polycab/Std', uom: 'Set', qty: 'As Per req' },
  { sno: '7)', description: 'DC Cable', specification: 'Copper (4 Sqmm)', make: 'KEI/Polycab/Std', uom: 'Set', qty: 'As Per req' },
  { sno: '8)', description: 'Balance of Material', specification: 'Electric, Cable Tray & Hardware and accessories (as per IS Standard)', make: 'Standard', uom: 'Set', qty: 'As Per req' },
  { sno: '9)', description: 'Earthing Kit', specification: 'Copper bonded earthing electrode with earth enhancement chemical', make: 'Standard', uom: 'Set', qty: '3' },
  { sno: '10)', description: 'Lightning Arrestor', specification: 'Copper Bonded', make: 'Standard', uom: 'Set', qty: '1' },
  { sno: '11)', description: 'Gen Meter & Net Meter', specification: '5-10 Amp / 10-40 Amp', make: 'HPL & L&T', uom: 'Nos', qty: 'Inclusive' },
];

const warrantyData = [
  { item: 'Solar Module', warranty: '12 Years warranty', standard: 'From Manufacturer' },
  { item: 'Solar Module Performance', warranty: '30 Years warranty', standard: 'From Manufacturer' },
  { item: 'Solar Inverter', warranty: '10/7 years Product warranty', standard: 'From Manufacturer' },
  { item: 'Operation & Maintenance', warranty: '5 Years (comprehensive) for ACDB, DCDB and all Electrical Accessories', standard: 'From Gentech Solar LLP' },
];

const termsData = [
  { title: 'Standards', description: 'All the terms and conditions mentioned in this proposal are standard. Delivery of materials and commissioning of the solar system are dependent on-site location and government notices.' },
  { title: 'Payment', description: 'Advance: 20% with order | 70% Before dispatch of Solar Module and Inverters | 10% After Commissioning.' },
  { title: 'Taxes', description: 'GST @ 13.8% on System.' },
  { title: 'Insurance', description: 'Customer Scope.' },
  { title: 'Validity', description: 'Above rates are valid for 15 days from the date of offer.' },
  { title: 'Transportation', description: 'Including' },
  { title: 'Delivery, Installation, Commissioning', description: 'Within 5 to 6 Weeks from the date of confirmed Purchase order and advance payment in favour of Gentech Solar LLP.' },
  { title: 'Cancellation', description: 'Any order once placed cannot be cancelled or diverted due to any reasons under any conditions and the advance paid are non-refundable.' },
  { title: 'Monitoring', description: 'Remote monitoring system included in the cost.' },
  { title: 'Civil work and Fabrication', description: 'Civil work and fabrication work for solar system required is in Jresolutions scope.' },
  { title: 'Electrical Infrastructure Upgradation', description: 'Upgradation or replacement of Electrical Infrastructure, MCB, RCCB, ELCB, MCCB and accessories will be in client Scope.' },
  { title: 'Penalty For Late Payment', description: 'The client must honor the invoices raised by Jresolutions as per agreed payment terms. Late payments will be subject to interest of 2% per month or part thereof. Remaining 5% of the cost must be paid within a week after commissioning of the plant or the customer will be charged late fees of 3% of the project price.' },
  { title: 'On Grid Failure', description: 'The plant will cease to feed supply to the grid until the grid is restored.' },
  { title: 'Interruption in work', description: 'The Customer must not interrupt the works, and/or shall abstain from any act or omission which may delay the works.' },
];

const SolarProposal = ({ capacity = '10 KW', subsidy = '78,000', panelQty = 2 }) => {
  return (
    <div className="sp-proposal">
      <div className="sp-header">
        <div className="sp-company-details">
          <h1>JAY RAO ENGINEER SOLUTIONS</h1>
          <p><strong>Add:</strong> Near Hanuman Temple, Chota Tajbagh Square, Nagpur</p>
          <p><strong>Contact:</strong> 8806732711 / 7385035981</p>
          <p><strong>GSTIN:</strong> 27ALVPU9654L1ZQ</p>
          <p><strong>Web:</strong> <a href="http://www.jresolutions.com" target="_blank" rel="noopener noreferrer">www.jresolutions.com</a></p>
        </div>
      </div>

      <p className="sp-date"><strong>Date:</strong> {new Date().toLocaleDateString('en-IN')}</p>

      <h2 className="sp-main-title">ON-GRID ROOFTOP SOLAR POWER PLANT CAPACITY – {capacity}</h2>

      <div className="sp-subsidy-box">
        <p><strong>• Subsidy Amount For {capacity} = ₹ {subsidy}/-</strong></p>
        <p className="sp-note"><strong>Load Extension Demand – EXTRA AT ACTUAL</strong></p>
      </div>

      <h3>Why Go Solar?</h3>
      <ul>
        <li>Reduced electricity cost for the next 25 years.</li>
        <li>Solar power is pollution-free and causes no greenhouse gases to be emitted after installation.</li>
        <li>It is a renewable, clean source of electricity, available every day of the year.</li>
      </ul>

      <h3>Material Description</h3>
      <div className="sp-table-wrap">
        <table className="sp-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Description</th>
              <th>Specification</th>
              <th>Make</th>
              <th>UOM</th>
              <th>Qty</th>
            </tr>
          </thead>
          <tbody>
            {materialData(panelQty).map((item, i) => (
              <tr key={i}>
                <td>{item.sno}</td>
                <td>{item.description}</td>
                <td>{item.specification}</td>
                <td>{item.make}</td>
                <td>{item.uom}</td>
                <td>{item.qty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3>Warranty &amp; Standards</h3>
      <div className="sp-table-wrap">
        <table className="sp-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Warranty</th>
              <th>Standard</th>
            </tr>
          </thead>
          <tbody>
            {warrantyData.map((row, i) => (
              <tr key={i}>
                <td>{row.item}</td>
                <td>{row.warranty}</td>
                <td>{row.standard}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3>Scope of Work</h3>
      <ul>
        <li>Liasoning for Net metering approval and commissioning.</li>
        <li>Designing of Solar PV Plant.</li>
        <li>Supply and installation of module mounting structure.</li>
        <li>Installation of PV modules.</li>
        <li>Supply and installation of inverters, distribution boards, energy meters, etc.</li>
        <li>Supply and installation of associated cables and electrical works of the solar plant with earthing.</li>
        <li>Commissioning and trial run of the solar plant.</li>
        <li>Five years of comprehensive maintenance.</li>
      </ul>

      <h3>Scope of Client</h3>
      <ul>
        <li>Adequate shade-free rooftop/ground allocation for installation of the solar plant.</li>
        <li>Availability of grid and approach to site.</li>
        <li>Temporary power and water arrangement during EPC.</li>
        <li>Internet Connection.</li>
        <li>Material to be stocked safely at the site.</li>
      </ul>

      <h3>Project Notes</h3>
      <ul>
        <li>The specifications, configuration, capacity, and quantities quoted are tentative and subject to change during in-detail engineering as per MNRE specification.</li>
        <li>It is assumed that the ground is easily accessible, flat, and shadow-free.</li>
        <li>The system will be terminated with the existing LT Panel through an available spare feeder within the building.</li>
        <li>System generation is based on actual site conditions.</li>
      </ul>

      <h3>Terms &amp; Conditions</h3>
      <div className="sp-table-wrap">
        <table className="sp-table sp-terms-table">
          <tbody>
            {termsData.map((t, i) => (
              <tr key={i}>
                <th>{t.title}</th>
                <td>{t.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3>Exclusions</h3>
      <p>The warranty shall not apply to defects resulting from:</p>
      <ul>
        <li>Any materials, components, tools, design, or software provided by the client.</li>
        <li>Negligence or willful misconduct of the client or anyone.</li>
        <li>Improper service work, installations, or alterations carried out by the client or a third party without our written consent.</li>
        <li>Any trial or experiment carried out by the client on the system without our written consent.</li>
        <li>Warranty does not cover damages due to manual tampering or destruction due to natural calamities.</li>
      </ul>

      <p className="sp-warranty-note"><strong>Warranty: 5 YEARS</strong></p>

      <div className="sp-signatures">
        <div>
          <p><strong>For Jay Rao Engineer Solutions</strong></p>
          <p><strong>Er. Sanyog D Uikey</strong> (CEO &amp; Founder)</p>
          <p>8806732711</p>
          <p><strong>Sameer D Uikey</strong> (Co-founder)</p>
          <p>7385035981</p>
        </div>
        <div>
          <p><strong>Client Signature</strong></p>
        </div>
      </div>

      <p className="sp-contact-box">
        <strong>Mail:</strong> jayraoengineersolutions@gmail.com | <strong>Web:</strong> www.jresolutions.com
      </p>

      <h3>Bank Details</h3>
      <div className="sp-bank">
        <p><strong>Bank Name:</strong> STATE BANK OF INDIA</p>
        <p><strong>Branch:</strong> DIGHORI ROAD, NAGPUR</p>
        <p><strong>Account Holder:</strong> SANYOG DEORAOJI UIKEY</p>
        <p><strong>IFSC Code:</strong> SBIN0016097</p>
        <p><strong>Account No.:</strong> 40990506292</p>
      </div>
    </div>
  );
};

// ✅ Prop validation to fix ESLint warnings
SolarProposal.propTypes = {
  capacity: PropTypes.string,
  subsidy: PropTypes.string,
  panelQty: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default SolarProposal;