import React, { useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import {
  Autocomplete,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Chip,
} from '@mui/material'
import { CRow, CCol, CButton, CFormInput, CFormSelect, CBadge } from '@coreui/react'
import { FILTER_GROUPS, countActiveFilters } from '../../../api/hrisReport'

// The 55 employee filters, rendered from the catalogue in api/hrisReport.js
// rather than hand-written. Adding a filter there adds it here.
//
// Every control leaves its value EMPTY when unset. An empty filter is not sent
// to the backend at all, which is what lets each stored procedure apply its own
// default — @EmploymentStatus = 'Active' being the one that matters most.

const TRI_OPTIONS = [
  { value: '', label: 'Any' },
  { value: 'true', label: 'Yes' },
  { value: 'false', label: 'No' },
]

const MultiPicker = ({ field, options, value, onChange }) => {
  const selected = useMemo(() => {
    const ids = new Set((value || []).map((v) => String(v)))
    return (options || []).filter((o) => ids.has(String(o.Id)))
  }, [options, value])

  return (
    <Autocomplete
      multiple
      size="small"
      disableCloseOnSelect
      limitTags={2}
      options={options || []}
      value={selected}
      isOptionEqualToValue={(a, b) => String(a.Id) === String(b.Id)}
      getOptionLabel={(o) => String(o.Name == null ? '' : o.Name)}
      onChange={(e, picked) => onChange(picked.map((p) => p.Id))}
      renderTags={(tags, getTagProps) =>
        tags.map((tag, index) => (
          <Chip
            size="small"
            label={String(tag.Name == null ? '' : tag.Name)}
            {...getTagProps({ index })}
            key={tag.Id}
          />
        ))
      }
      renderInput={(params) => <TextField {...params} label={field.label} placeholder="Any" />}
    />
  )
}

MultiPicker.propTypes = {
  field: PropTypes.object.isRequired,
  options: PropTypes.array,
  value: PropTypes.array,
  onChange: PropTypes.func.isRequired,
}

const FilterPanel = ({
  meta,
  dimensionValues,
  filters,
  setFilter,
  onClear,
  onLoadEmployees,
  employeesLoading,
}) => {
  const [expanded, setExpanded] = useState('org')

  const optionsFor = (field) => {
    const list = (meta && meta.options && meta.options[field.source]) || []
    // Cascading: narrow divisions/sections to the chosen departments, cities to
    // the chosen regions. Only narrows when the parent filter is actually set.
    if (field.cascadeOn && field.cascadeKey) {
      const parent = filters[field.cascadeOn]
      if (Array.isArray(parent) && parent.length) {
        const allowed = new Set(parent.map((v) => String(v)))
        const narrowed = list.filter((o) => allowed.has(String(o[field.cascadeKey])))
        // A lookup row with no parent id would otherwise become unreachable, so
        // fall back to the full list rather than showing an empty dropdown.
        if (narrowed.length) return narrowed
      }
    }
    return list
  }

  const renderField = (field) => {
    const value = filters[field.name]

    switch (field.type) {
      case 'multi': {
        const options = optionsFor(field)
        const needsLoad = field.lazy && options.length === 0
        return (
          <div>
            <MultiPicker
              field={field}
              options={options}
              value={value}
              onChange={(v) => setFilter(field.name, v)}
            />
            {needsLoad ? (
              <CButton
                size="sm"
                color="secondary"
                variant="ghost"
                className="mt-1 p-0"
                disabled={employeesLoading}
                onClick={onLoadEmployees}
              >
                {employeesLoading ? 'Loading employees…' : 'Load employee list'}
              </CButton>
            ) : null}
          </div>
        )
      }

      case 'dimMulti': {
        const values = (dimensionValues && dimensionValues[field.dimension]) || null
        if (!values) {
          return (
            <CFormInput
              size="sm"
              value={value || ''}
              placeholder={`${field.label} (comma separated)`}
              onChange={(e) => setFilter(field.name, e.target.value)}
            />
          )
        }
        const options = values.map((v) => ({ Id: v.Label, Name: v.Label }))
        return (
          <MultiPicker
            field={field}
            options={options}
            value={Array.isArray(value) ? value : value ? String(value).split(',') : []}
            onChange={(v) => setFilter(field.name, v)}
          />
        )
      }

      case 'dim': {
        const values = (dimensionValues && dimensionValues[field.dimension]) || null
        // Until the dimension's values arrive — or if the SQL pack does not
        // publish that dimension at all — fall back to free text rather than an
        // empty dropdown the admin cannot use.
        if (!values) {
          return (
            <CFormInput
              size="sm"
              value={value || ''}
              placeholder="Any"
              onChange={(e) => setFilter(field.name, e.target.value)}
            />
          )
        }
        return (
          <CFormSelect
            size="sm"
            value={value || ''}
            onChange={(e) => setFilter(field.name, e.target.value)}
          >
            <option value="">Any</option>
            <option value="All">All</option>
            {values.map((v) => (
              <option key={v.Label} value={v.Label}>
                {v.Label} ({v.Employees})
              </option>
            ))}
          </CFormSelect>
        )
      }

      case 'tri':
        return (
          <CFormSelect
            size="sm"
            value={value === undefined || value === null ? '' : String(value)}
            onChange={(e) => setFilter(field.name, e.target.value)}
          >
            {TRI_OPTIONS.map((o) => (
              <option key={o.label} value={o.value}>
                {o.label}
              </option>
            ))}
          </CFormSelect>
        )

      case 'date':
        return (
          <CFormInput
            size="sm"
            type="date"
            value={value || ''}
            onChange={(e) => setFilter(field.name, e.target.value)}
          />
        )

      case 'num':
        return (
          <CFormInput
            size="sm"
            type="number"
            value={value === undefined || value === null ? '' : value}
            placeholder="Any"
            onChange={(e) => setFilter(field.name, e.target.value)}
          />
        )

      default:
        return (
          <CFormInput
            size="sm"
            value={value || ''}
            placeholder="Any"
            onChange={(e) => setFilter(field.name, e.target.value)}
          />
        )
    }
  }

  const activeInGroup = (group) =>
    countActiveFilters(
      group.fields.reduce((acc, f) => {
        acc[f.name] = filters[f.name]
        return acc
      }, {}),
    )

  const total = countActiveFilters(filters)

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <span className="fw-semibold">
          Filters{' '}
          {total > 0 ? (
            <CBadge color="primary" className="ms-1">
              {total}
            </CBadge>
          ) : null}
        </span>
        <CButton size="sm" color="secondary" variant="ghost" disabled={!total} onClick={onClear}>
          Clear all
        </CButton>
      </div>

      {FILTER_GROUPS.map((group) => {
        const count = activeInGroup(group)
        return (
          <Accordion
            key={group.key}
            disableGutters
            expanded={expanded === group.key}
            onChange={() => setExpanded(expanded === group.key ? '' : group.key)}
            sx={{ '&:before': { display: 'none' }, mb: 1, borderRadius: 2 }}
          >
            <AccordionSummary sx={{ minHeight: 44 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {group.label}
                </Typography>
                {count > 0 ? (
                  <Chip size="small" color="primary" label={count} sx={{ height: 18 }} />
                ) : null}
                <Box sx={{ flex: 1 }} />
                <Typography variant="caption" color="text.secondary">
                  {expanded === group.key ? '−' : '+'}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              <CRow className="g-2">
                {group.fields.map((field) => (
                  <CCol xs={12} key={field.name}>
                    {field.type === 'multi' || field.type === 'dimMulti' ? null : (
                      <label className="small text-medium-emphasis mb-1 d-block">
                        {field.label}
                      </label>
                    )}
                    {renderField(field)}
                    {field.hint ? (
                      <div className="text-medium-emphasis" style={{ fontSize: '0.72rem' }}>
                        {field.hint}
                      </div>
                    ) : null}
                  </CCol>
                ))}
              </CRow>
            </AccordionDetails>
          </Accordion>
        )
      })}
    </div>
  )
}

FilterPanel.propTypes = {
  meta: PropTypes.object,
  dimensionValues: PropTypes.object,
  filters: PropTypes.object.isRequired,
  setFilter: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
  onLoadEmployees: PropTypes.func,
  employeesLoading: PropTypes.bool,
}

export default FilterPanel
