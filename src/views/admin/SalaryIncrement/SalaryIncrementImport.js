import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useSelector } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CForm,
  CFormInput,
  CFormLabel,
  CFormCheck,
  CButton,
  CRow,
  CCol,
  CSpinner,
  CAlert,
  CTable,
  CTableHead,
  CTableHeaderCell,
  CTableBody,
  CTableRow,
  CTableDataCell,
  CBadge,
} from '@coreui/react';

const API_URL = 'https://aps2.zemenbank.com/zbss/api/salary-increment/import';

const initialForm = {
  fiscal_year: new Date().getFullYear(),
  reference_number: '',
  effective_date: '',
  board_meeting_date: '',
  letter_date: '',
  overwrite: false,
};

const SalaryIncrementImport = () => {
  const accessToken = useSelector((state) => state.user.accessToken);
  const [form, setForm] = useState(initialForm);
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel.sheet.macroEnabled.12': ['.xlsm'],
    },
    multiple: false,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
        setError(null);
      }
    },
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!file) {
      setError('Please select an Excel file (.xlsx) to upload.');
      return;
    }
    if (!String(form.reference_number).trim()) {
      setError('Reference number is required.');
      return;
    }
    if (!form.effective_date || !form.board_meeting_date || !form.letter_date) {
      setError('All three dates (effective, board meeting, letter) are required.');
      return;
    }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('fiscal_year', String(form.fiscal_year));
      fd.append('reference_number', String(form.reference_number).trim());
      fd.append('effective_date', form.effective_date);
      fd.append('board_meeting_date', form.board_meeting_date);
      fd.append('letter_date', form.letter_date);
      if (form.overwrite) fd.append('overwrite', 'true');

      const resp = await fetch(API_URL, {
        method: 'POST',
        headers: { 'x-access-token': accessToken || '' },
        body: fd,
      });

      const body = await resp.json().catch(() => ({}));

      if (resp.status === 409) {
        setError(
          body.message ||
            'Fiscal year already imported. Tick "Overwrite existing import" and re-submit to replace it.'
        );
        return;
      }

      if (!resp.ok) {
        setError(body.message || `Server returned ${resp.status}`);
        // Surface partial diagnostics so admin can fix the workbook.
        if (body.row_errors || body.sheet_warnings) {
          setResult(body);
        }
        return;
      }

      setResult(body);
      toast.success(`Imported ${body.total_imported} letter(s) for FY ${body.fiscal_year}`);
      setFile(null);
    } catch (err) {
      setError((err && err.message) || 'Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const formatBytes = (n) => {
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
    return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <>
      <ToastContainer position="top-right" />
      <CCard className="mb-4">
        <CCardHeader>
          <h4 className="mb-0">Salary Increment Import</h4>
          <small className="text-medium-emphasis">
            Upload the annual salary-increment workbook. One import per fiscal year.
          </small>
        </CCardHeader>
        <CCardBody>
          {error && <CAlert color="danger">{error}</CAlert>}

          <CForm onSubmit={handleSubmit}>
            <CRow className="mb-3">
              <CCol md={3}>
                <CFormLabel htmlFor="fiscal_year">Fiscal Year</CFormLabel>
                <CFormInput
                  type="number"
                  id="fiscal_year"
                  name="fiscal_year"
                  value={form.fiscal_year}
                  onChange={handleChange}
                  required
                  min={2000}
                  max={3000}
                />
              </CCol>
              <CCol md={9}>
                <CFormLabel htmlFor="reference_number">Reference Number</CFormLabel>
                <CFormInput
                  type="text"
                  id="reference_number"
                  name="reference_number"
                  placeholder="e.g. ZB/HC/2198/2025"
                  value={form.reference_number}
                  onChange={handleChange}
                  required
                />
                <small className="text-medium-emphasis">
                  The Board's decision-document reference. Same value renders on every letter in this batch.
                </small>
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={4}>
                <CFormLabel htmlFor="effective_date">Effective Date</CFormLabel>
                <CFormInput
                  type="date"
                  id="effective_date"
                  name="effective_date"
                  value={form.effective_date}
                  onChange={handleChange}
                  required
                />
                <small className="text-medium-emphasis">When the salary increase takes effect.</small>
              </CCol>
              <CCol md={4}>
                <CFormLabel htmlFor="board_meeting_date">Board Meeting Date</CFormLabel>
                <CFormInput
                  type="date"
                  id="board_meeting_date"
                  name="board_meeting_date"
                  value={form.board_meeting_date}
                  onChange={handleChange}
                  required
                />
                <small className="text-medium-emphasis">Date the Board approved the increment.</small>
              </CCol>
              <CCol md={4}>
                <CFormLabel htmlFor="letter_date">Letter Date</CFormLabel>
                <CFormInput
                  type="date"
                  id="letter_date"
                  name="letter_date"
                  value={form.letter_date}
                  onChange={handleChange}
                  required
                />
                <small className="text-medium-emphasis">Prints on the letter header.</small>
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol>
                <CFormLabel>Excel Workbook</CFormLabel>
                <div
                  {...getRootProps()}
                  style={{
                    border: '2px dashed #c4c9d1',
                    borderRadius: 6,
                    padding: 24,
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: isDragActive ? '#eef3ff' : '#fafbfc',
                  }}
                >
                  <input {...getInputProps()} />
                  {file ? (
                    <div>
                      <strong>{file.name}</strong>
                      <div className="text-medium-emphasis">{formatBytes(file.size)}</div>
                      <small className="text-medium-emphasis">Click or drop to replace.</small>
                    </div>
                  ) : (
                    <div className="text-medium-emphasis">
                      {isDragActive
                        ? 'Drop the workbook here…'
                        : 'Drag & drop a .xlsx file here, or click to choose'}
                    </div>
                  )}
                </div>
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol>
                <CFormCheck
                  id="overwrite"
                  name="overwrite"
                  label="Overwrite existing import for this fiscal year (the previous batch is marked superseded and its letters are deleted)"
                  checked={form.overwrite}
                  onChange={handleChange}
                />
              </CCol>
            </CRow>

            <CButton type="submit" color="primary" disabled={submitting}>
              {submitting ? (
                <>
                  <CSpinner size="sm" className="me-2" /> Uploading…
                </>
              ) : (
                'Import Workbook'
              )}
            </CButton>
          </CForm>
        </CCardBody>
      </CCard>

      {result && (
        <CCard className="mb-4">
          <CCardHeader>
            <h5 className="mb-0">Import Result</h5>
          </CCardHeader>
          <CCardBody>
            <CRow>
              <CCol md={6}>
                <p className="mb-2">
                  <strong>Fiscal year:</strong> {result.fiscal_year}
                </p>
                <p className="mb-2">
                  <strong>Reference number:</strong> {result.reference_number}
                </p>
                <p className="mb-2">
                  <strong>Total imported:</strong> {result.total_imported}
                </p>
                <p className="mb-2">
                  <strong>Notifications sent:</strong> {result.notifications_sent || 0}
                  {result.notifications_failed > 0 && (
                    <span className="text-warning"> ({result.notifications_failed} failed)</span>
                  )}
                </p>
                {result.overwritten && (
                  <CAlert color="info" className="py-2 mt-2">
                    The previous batch for FY {result.fiscal_year} has been superseded.
                  </CAlert>
                )}
              </CCol>
              <CCol md={6}>
                <h6>Per category</h6>
                <ul className="list-unstyled">
                  {result.per_category &&
                    Object.entries(result.per_category).map(([cat, count]) => (
                      <li key={cat} className="mb-1">
                        <CBadge color="primary" className="me-2">
                          {count}
                        </CBadge>
                        {cat}
                      </li>
                    ))}
                </ul>
              </CCol>
            </CRow>

            {result.sheet_warnings && result.sheet_warnings.length > 0 && (
              <>
                <h6 className="mt-3">Sheet warnings ({result.sheet_warnings.length})</h6>
                <CTable small bordered>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Sheet</CTableHeaderCell>
                      <CTableHeaderCell>Reason</CTableHeaderCell>
                      <CTableHeaderCell>Details</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {result.sheet_warnings.map((w, i) => (
                      <CTableRow key={i}>
                        <CTableDataCell>{w.sheet}</CTableDataCell>
                        <CTableDataCell>
                          <code>{w.reason}</code>
                        </CTableDataCell>
                        <CTableDataCell>{w.details || '-'}</CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              </>
            )}

            {result.row_errors && result.row_errors.length > 0 && (
              <>
                <h6 className="mt-3">Row errors ({result.row_errors.length})</h6>
                <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                  <CTable small bordered>
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>Sheet</CTableHeaderCell>
                        <CTableHeaderCell>Row</CTableHeaderCell>
                        <CTableHeaderCell>Domain user</CTableHeaderCell>
                        <CTableHeaderCell>Reason</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {result.row_errors.map((r, i) => (
                        <CTableRow key={i}>
                          <CTableDataCell>{r.sheet || '-'}</CTableDataCell>
                          <CTableDataCell>{r.excel_row || '-'}</CTableDataCell>
                          <CTableDataCell>{r.domain_user || '-'}</CTableDataCell>
                          <CTableDataCell>
                            <code>{r.reason}</code>
                            {r.details && (
                              <>
                                {' '}
                                · <small className="text-medium-emphasis">{r.details}</small>
                              </>
                            )}
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                </div>
              </>
            )}
          </CCardBody>
        </CCard>
      )}
    </>
  );
};

export default SalaryIncrementImport;
