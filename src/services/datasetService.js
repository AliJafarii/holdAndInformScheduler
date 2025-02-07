// src/services/datasetService.js
const axios = require('axios');
const config = require('../config');

async function fetchDataset() {
  try {
    const response = await axios.post(
      config.datasetApi,
      {
        type: 'native',
        native: {
          query: `SELECT c.account_no cif, c.external_id nid, c.mobile_no Mobile, c.display_name, a.id box_id,
                         a.account_no box_account, ma.id main_account_id, ma.account_no main_account_no, ma.iban main_account_iban,
                         CASE WHEN a.ACCOUNT_BALANCE_DERIVED IS NOT NULL THEN TO_CHAR(a.ACCOUNT_BALANCE_DERIVED, '999,999,999,999,999') ELSE ' ' END ACCOUNT_BALANCE,
                         CASE WHEN a.TOTAL_SAVINGS_AMOUNT_ON_HOLD IS NOT NULL THEN TO_CHAR(a.TOTAL_SAVINGS_AMOUNT_ON_HOLD, '999,999,999,999,999') ELSE ' ' END AMOUNT_ON_HOLD
                  FROM mifostenantdefault.m_savings_account a
                  JOIN bluparty.m_client c ON a.client_id = c.id
                  JOIN mifostenantdefault.m_savings_account ma ON a.client_id = ma.client_id AND ma.product_id = 22 AND ma.STATUS_ENUM = 300
                  WHERE a.product_id = 163 AND a.STATUS_ENUM = 300
                    AND (a.TOTAL_SAVINGS_AMOUNT_ON_HOLD = 0 OR a.TOTAL_SAVINGS_AMOUNT_ON_HOLD IS NULL)
                    AND a.ACCOUNT_BALANCE_DERIVED >= 5000000000
                  ORDER BY a.ACCOUNT_BALANCE_DERIVED DESC, a.TOTAL_SAVINGS_AMOUNT_ON_HOLD DESC`,
          'template-tags': {},
        },
        database: 16,
        parameters: [],
      },
      {
        headers: {
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9,fa;q=0.8,fr;q=0.7,nl;q=0.6',
          'Connection': 'keep-alive',
          'Content-Type': 'application/json',
          'Cookie': config.dataset_cookie,
          'Origin': 'https://insights.blubank.com',
          'Referer': 'https://insights.blubank.com/question',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin',
          'User-Agent': 'Mozilla/5.0',
        },
        timeout: 10000,
      }
    );

    if (
      !response.data ||
      !response.data.data ||
      !Array.isArray(response.data.data.rows) ||
      typeof response.data.row_count !== 'number'
    ) {
      throw new Error('Dataset API response is malformed');
    }

    console.log('Dataset API call successful.');
    return {
      rows: response.data.data.rows,
      rowCount: response.data.row_count,
    };
  } catch (error) {
    if (error.response) {
      console.error('Dataset API Error:', {
        status: error.response.status,
        data: error.response.data,
      });
    } else if (error.request) {
      console.error('Dataset API No Response:', error.request);
    } else {
      console.error('Dataset API Setup Error:', error.message);
    }
    throw new Error('Failed to retrieve dataset from Dataset API');
  }
}

module.exports = {
  fetchDataset,
};
