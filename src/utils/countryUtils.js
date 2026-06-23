const regionNames = new Intl.DisplayNames(['en'], { type: 'region' })

const ISO_COUNTRY_CODES = [
  'AD', 'AE', 'AF', 'AG', 'AI', 'AL', 'AM', 'AO', 'AQ', 'AR', 'AS', 'AT', 'AU', 'AW', 'AX', 'AZ',
  'BA', 'BB', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BL', 'BM', 'BN', 'BO', 'BQ', 'BR', 'BS',
  'BT', 'BV', 'BW', 'BY', 'BZ', 'CA', 'CC', 'CD', 'CF', 'CG', 'CH', 'CI', 'CK', 'CL', 'CM', 'CN',
  'CO', 'CR', 'CU', 'CV', 'CW', 'CX', 'CY', 'CZ', 'DE', 'DJ', 'DK', 'DM', 'DO', 'DZ', 'EC', 'EE',
  'EG', 'EH', 'ER', 'ES', 'ET', 'FI', 'FJ', 'FK', 'FM', 'FO', 'FR', 'GA', 'GB', 'GD', 'GE', 'GF',
  'GG', 'GH', 'GI', 'GL', 'GM', 'GN', 'GP', 'GQ', 'GR', 'GS', 'GT', 'GU', 'GW', 'GY', 'HK', 'HM',
  'HN', 'HR', 'HT', 'HU', 'ID', 'IE', 'IL', 'IM', 'IN', 'IO', 'IQ', 'IR', 'IS', 'IT', 'JE', 'JM',
  'JO', 'JP', 'KE', 'KG', 'KH', 'KI', 'KM', 'KN', 'KP', 'KR', 'KW', 'KY', 'KZ', 'LA', 'LB', 'LC',
  'LI', 'LK', 'LR', 'LS', 'LT', 'LU', 'LV', 'LY', 'MA', 'MC', 'MD', 'ME', 'MF', 'MG', 'MH', 'MK',
  'ML', 'MM', 'MN', 'MO', 'MP', 'MQ', 'MR', 'MS', 'MT', 'MU', 'MV', 'MW', 'MX', 'MY', 'MZ', 'NA',
  'NC', 'NE', 'NF', 'NG', 'NI', 'NL', 'NO', 'NP', 'NR', 'NU', 'NZ', 'OM', 'PA', 'PE', 'PF', 'PG',
  'PH', 'PK', 'PL', 'PM', 'PN', 'PR', 'PS', 'PT', 'PW', 'PY', 'QA', 'RE', 'RO', 'RS', 'RU', 'RW',
  'SA', 'SB', 'SC', 'SD', 'SE', 'SG', 'SH', 'SI', 'SJ', 'SK', 'SL', 'SM', 'SN', 'SO', 'SR', 'SS',
  'ST', 'SV', 'SX', 'SY', 'SZ', 'TC', 'TD', 'TF', 'TG', 'TH', 'TJ', 'TK', 'TL', 'TM', 'TN', 'TO',
  'TR', 'TT', 'TV', 'TW', 'TZ', 'UA', 'UG', 'UM', 'US', 'UY', 'UZ', 'VA', 'VC', 'VE', 'VG', 'VI',
  'VN', 'VU', 'WF', 'WS', 'YE', 'YT', 'ZA', 'ZM', 'ZW',
]

let countryNameToCode = null

function getCountryNameToCode() {
  if (countryNameToCode) return countryNameToCode

  countryNameToCode = new Map()
  for (const code of ISO_COUNTRY_CODES) {
    try {
      const name = regionNames.of(code)
      if (name) countryNameToCode.set(name.toLowerCase(), code)
    } catch {
      // skip
    }
  }

  return countryNameToCode
}

export function isGaNotSet(value) {
  if (value == null || value === '') return true
  const normalized = String(value).trim().toLowerCase()
  return normalized === '(not set)' || normalized === 'not set' || normalized === '(not provided)'
}

export function codeFromCountryName(name) {
  if (isGaNotSet(name)) return null
  return getCountryNameToCode().get(String(name).trim().toLowerCase()) ?? null
}

export function resolveCountryFromGa(row) {
  const gaCountryId = String(row.countryId ?? row.gaCountryId ?? row.code ?? '').trim()
  const gaCountry = String(row.country ?? row.gaCountry ?? row.name ?? '').trim()
  const users = Number(row.activeUsers ?? row.users ?? 0)

  let code = null
  if (/^[A-Z]{2}$/i.test(gaCountryId) && !isGaNotSet(gaCountryId)) {
    code = gaCountryId.toUpperCase()
  } else if (/^[A-Z]{2}$/i.test(gaCountry) && !isGaNotSet(gaCountry)) {
    code = gaCountry.toUpperCase()
  } else if (!isGaNotSet(gaCountry)) {
    code = codeFromCountryName(gaCountry)
  }

  let name = null
  if (!isGaNotSet(gaCountry) && !/^[A-Z]{2}$/i.test(gaCountry)) {
    name = gaCountry
  }

  if (!name && code) {
    name = regionNames.of(code) || code
  }

  if (!name && !isGaNotSet(gaCountryId) && !/^[A-Z]{2}$/i.test(gaCountryId)) {
    name = gaCountryId
  }

  if (!name) {
    name = isGaNotSet(gaCountry) ? gaCountry || gaCountryId || '(not set)' : gaCountry
  }

  if (code && /^[A-Z]{2}$/i.test(name)) {
    name = regionNames.of(code) || name
  }

  return {
    code,
    name,
    gaCountry: gaCountry || null,
    gaCountryId: gaCountryId || null,
    users,
  }
}
