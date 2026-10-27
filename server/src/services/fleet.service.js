import fs from 'fs';
import path from 'path';
import { config } from '../config/index.js';

let fleetCache = [];
let testDataByEngine = new Map();
let isInitialized = false;

// Sensor descriptions for rich UI context
export const SENSOR_METADATA = {
  sensor_1: { name: 'Fan Inlet Temp (T2)', unit: '°R', standard: 518.67, desc: 'Total temperature at fan inlet' },
  sensor_2: { name: 'LPC Outlet Temp (T24)', unit: '°R', standard: 642.0, desc: 'Total temperature at low-pressure compressor outlet' },
  sensor_3: { name: 'HPC Outlet Temp (T30)', unit: '°R', standard: 1590.0, desc: 'Total temperature at high-pressure compressor outlet' },
  sensor_4: { name: 'LPT Outlet Temp (T50)', unit: '°R', standard: 1400.0, desc: 'Total temperature at low-pressure turbine outlet' },
  sensor_5: { name: 'Fan Inlet Pressure (P2)', unit: 'psia', standard: 14.62, desc: 'Pressure at fan inlet' },
  sensor_6: { name: 'Bypass Duct Pressure (P15)', unit: 'psia', standard: 21.61, desc: 'Total pressure in bypass duct' },
  sensor_7: { name: 'HPC Outlet Pressure (P30)', unit: 'psia', standard: 553.0, desc: 'Total pressure at high-pressure compressor outlet' },
  sensor_8: { name: 'Physical Fan Speed (Nf)', unit: 'rpm', standard: 2388.0, desc: 'Physical rotational speed of fan rotor' },
  sensor_9: { name: 'Physical Core Speed (Nc)', unit: 'rpm', standard: 9050.0, desc: 'Physical rotational speed of core compressor/turbine rotor' },
  sensor_10: { name: 'Engine Pressure Ratio (epr)', unit: 'ratio', standard: 1.30, desc: 'Engine pressure ratio (P50/P2)' },
  sensor_11: { name: 'HPC Static Pressure (Ps30)', unit: 'psia', standard: 47.5, desc: 'Static pressure at high-pressure compressor exit' },
  sensor_12: { name: 'Fuel Flow Ratio (phi)', unit: 'pps/psia', standard: 521.0, desc: 'Ratio of fuel flow to static pressure Ps30' },
  sensor_13: { name: 'Corrected Fan Speed (NRf)', unit: 'rpm', standard: 2388.0, desc: 'Corrected rotational speed of fan' },
  sensor_14: { name: 'Corrected Core Speed (NRc)', unit: 'rpm', standard: 8135.0, desc: 'Corrected rotational speed of engine core' },
  sensor_15: { name: 'Bypass Ratio (BPR)', unit: 'ratio', standard: 8.42, desc: 'Ratio between bypass duct air and core air' },
  sensor_16: { name: 'Burner Fuel-Air Ratio (farB)', unit: 'ratio', standard: 0.03, desc: 'Fuel-to-air mass ratio in combustion chamber' },
  sensor_17: { name: 'Bleed Enthalpy (htBleed)', unit: 'BTU', standard: 392.0, desc: 'Bleed air enthalpy' },
  sensor_18: { name: 'Demanded Fan Speed (PCNfR)', unit: 'rpm', standard: 2388.0, desc: 'Demanded rotational fan speed' },
  sensor_19: { name: 'Demanded Corr. Fan Speed (W31)', unit: 'rpm', standard: 100.0, desc: 'Demanded corrected fan speed' },
  sensor_20: { name: 'HPT Coolant Bleed (W32)', unit: 'lbm/s', standard: 38.9, desc: 'High-pressure turbine coolant bleed air flow' },
  sensor_21: { name: 'LPT Coolant Bleed', unit: 'lbm/s', standard: 23.4, desc: 'Low-pressure turbine coolant bleed air flow' }
};

export const fleetService = {
  init() {
    if (isInitialized) return;

    try {
      // 1. Try loading precomputed fleet cache
      const cachePath = path.join(config.artifactsDir, 'fleet_cache.json');
      if (fs.existsSync(cachePath)) {
        const raw = fs.readFileSync(cachePath, 'utf8');
        fleetCache = JSON.parse(raw);
        console.log(`[FleetService] Loaded ${fleetCache.length} engines from fleet_cache.json`);
      }

      // 2. Load test_FD001.txt for cycle-by-cycle sensor readings
      const testFilePath = path.join(config.cmapssDataDir, 'test_FD001.txt');
      if (fs.existsSync(testFilePath)) {
        console.log(`[FleetService] Parsing sensor history from ${testFilePath}...`);
        const content = fs.readFileSync(testFilePath, 'utf8');
        const lines = content.trim().split(/\r?\n/);

        testDataByEngine.clear();

        for (const line of lines) {
          const parts = line.trim().split(/\s+/).map(Number);
          if (parts.length < 26) continue;

          const engineId = parts[0];
          const cycle = parts[1];
          const settings = [parts[2], parts[3], parts[4]];
          const sensors = parts.slice(5, 26); // 21 sensors

          if (!testDataByEngine.has(engineId)) {
            testDataByEngine.set(engineId, []);
          }

          const sensorObj = {};
          sensors.forEach((val, idx) => {
            sensorObj[`sensor_${idx + 1}`] = val;
          });

          testDataByEngine.get(engineId).push({
            cycle,
            settings: {
              setting_1: settings[0],
              setting_2: settings[1],
              setting_3: settings[2]
            },
            ...sensorObj,
            sensors // raw array [s1..s21]
          });
        }
        console.log(`[FleetService] Loaded cycle history for ${testDataByEngine.size} test engines.`);
      }

      isInitialized = true;
    } catch (err) {
      console.error('[FleetService] Error initializing fleet data:', err);
    }
  },

  getAllEngines({ search = '', healthCategory = 'all', sortBy = 'engine_id', sortOrder = 'asc' } = {}) {
    this.init();

    let list = [...fleetCache];

    // Filter by health category
    if (healthCategory && healthCategory !== 'all') {
      list = list.filter(e => e.health_category.toLowerCase() === healthCategory.toLowerCase());
    }

    // Filter by search (engine_id or numeric_id)
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(e =>
        e.engine_id.toLowerCase().includes(q) ||
        String(e.numeric_id).includes(q)
      );
    }

    // Sort
    list.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      if (valA === undefined) valA = a.numeric_id;
      if (valB === undefined) valB = b.numeric_id;

      if (typeof valA === 'string') {
        return sortOrder === 'desc' ? valB.localeCompare(valA) : valA.localeCompare(valB);
      }
      return sortOrder === 'desc' ? valB - valA : valA - valB;
    });

    return {
      total: list.length,
      dataset: 'NASA C-MAPSS FD001',
      engines: list
    };
  },

  getEngineById(numericId) {
    this.init();

    const id = parseInt(numericId, 10);
    const engine = fleetCache.find(e => e.numeric_id === id);

    if (!engine) {
      return null;
    }

    const history = testDataByEngine.get(id) || [];
    const latestRow = history.length > 0 ? history[history.length - 1] : null;

    // Build specific maintenance suggestions based on predicted RUL
    let recommendedActions = [];
    if (engine.predicted_rul_cycles <= 15) {
      recommendedActions = [
        'Issue immediate ground stop alert for turbofan assembly.',
        'Perform bore-scope inspection on High-Pressure Compressor (HPC) stage 3-5.',
        'Inspect Low-Pressure Turbine (LPT) blade clearance and thermal barrier coating.',
        'Schedule priority replacement within next 48 operating hours.'
      ];
    } else if (engine.predicted_rul_cycles <= 40) {
      recommendedActions = [
        'Perform vibration analysis and check physical fan speed harmonics (Nf).',
        'Verify fuel flow ratio (phi) against baseline Ps30 static pressure.',
        'Inspect bypass duct seals and bleed valve actuation.',
        'Plan depot-level maintenance inspection within 2 weeks.'
      ];
    } else {
      recommendedActions = [
        'Turbofan operating within nominal safety envelope.',
        'Continue standard telemetric sensor data logging.',
        'Next scheduled borescope inspection at routine maintenance milestone.'
      ];
    }

    return {
      ...engine,
      total_recorded_cycles: history.length,
      latest_cycle_reading: latestRow,
      recommended_actions: recommendedActions,
      sensor_metadata: SENSOR_METADATA
    };
  },

  getEngineSensorHistory(numericId, selectedSensors = ['sensor_2', 'sensor_3', 'sensor_4', 'sensor_7', 'sensor_11', 'sensor_12', 'sensor_15']) {
    this.init();

    const id = parseInt(numericId, 10);
    const history = testDataByEngine.get(id);

    if (!history) {
      return [];
    }

    return history.map(item => {
      const res = { cycle: item.cycle };
      selectedSensors.forEach(s => {
        if (item[s] !== undefined) {
          res[s] = item[s];
        }
      });
      return res;
    });
  },

  getEngineLatestWindow(numericId) {
    this.init();

    const id = parseInt(numericId, 10);
    const history = testDataByEngine.get(id);

    if (!history || history.length < 30) {
      return null;
    }

    // Get final 30 cycles
    const last30 = history.slice(-30);
    const sequence = last30.map(row => row.sensors);

    return {
      engine_id: `FD001-${String(id).padStart(3, '0')}`,
      numeric_id: id,
      window_size: 30,
      feature_count: 21,
      cycles: last30.map(r => r.cycle),
      sequence,
      raw_rows: last30.map(r => {
        const row = { cycle: r.cycle };
        for (let i = 1; i <= 21; i++) {
          row[`sensor_${i}`] = r[`sensor_${i}`];
        }
        return row;
      })
    };
  },

  getSampleEngines() {
    this.init();
    // Return sample engines across categories
    return [
      fleetCache.find(e => e.health_category === 'Critical') || fleetCache[33], // Engine 34
      fleetCache.find(e => e.health_category === 'Warning') || fleetCache[80],  // Engine 81
      fleetCache.find(e => e.health_category === 'Monitor') || fleetCache[0]   // Engine 1
    ].filter(Boolean);
  }
};
