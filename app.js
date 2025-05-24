// Industry-specific EBITDA multiples
const INDUSTRY_MULTIPLES = {
    saas: { min: 8, max: 12 },
    manufacturing: { min: 4, max: 8 },
    retail: { min: 3, max: 6 },
    healthcare: { min: 6, max: 10 },
    fintech: { min: 7, max: 11 }
};

// Risk-based discount rates
const RISK_DISCOUNT_RATES = {
    low: 0.10,
    medium: 0.15,
    high: 0.20
};

// Utility function to format currency
const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    }).format(value);
};

// Calculate EBITDA multiple valuation
function calculateEBITDAMultiple(ebitda, sector) {
    const multiple = INDUSTRY_MULTIPLES[sector];
    return {
        low: ebitda * multiple.min,
        high: ebitda * multiple.max,
        average: ebitda * ((multiple.min + multiple.max) / 2)
    };
}

// Calculate DCF valuation
function calculateDCF(ebitda, growthRate, riskLevel) {
    const discountRate = RISK_DISCOUNT_RATES[riskLevel];
    let presentValue = 0;
    let currentEbitda = ebitda;
    
    // Project cash flows for 5 years
    for (let year = 1; year <= 5; year++) {
        currentEbitda *= (1 + (growthRate / 100));
        presentValue += currentEbitda / Math.pow(1 + discountRate, year);
    }
    
    // Terminal value calculation (using perpetuity growth of 2%)
    const terminalValue = (currentEbitda * (1.02)) / (discountRate - 0.02);
    const discountedTerminalValue = terminalValue / Math.pow(1 + discountRate, 5);
    
    return {
        low: presentValue * 0.9,
        high: presentValue + discountedTerminalValue,
        average: (presentValue + (presentValue + discountedTerminalValue)) / 2
    };
}

// Generate recommendations based on inputs and results
function generateRecommendations(inputs, results) {
    const recommendations = [];
    
    // EBITDA margin analysis
    const ebitdaMargin = (inputs.ebitda / inputs.revenue) * 100;
    if (ebitdaMargin < 15) {
        recommendations.push("Consider implementing cost optimization strategies to improve EBITDA margins.");
    }
    
    // Growth rate analysis
    if (inputs.growthRate < 10) {
        recommendations.push("Explore new market opportunities to accelerate growth rate.");
    }
    
    // Risk level analysis
    if (inputs.riskLevel === 'high') {
        recommendations.push("Focus on risk mitigation strategies to potentially lower the cost of capital.");
    }
    
    // Valuation spread analysis
    const valuationSpread = ((results.high - results.low) / results.low) * 100;
    if (valuationSpread > 50) {
        recommendations.push("Consider improving business predictability to narrow valuation range.");
    }
    
    return recommendations;
}

// Main valuation calculation function
function calculateValuation(inputs) {
    const ebitdaValuation = calculateEBITDAMultiple(inputs.ebitda, inputs.sector);
    const dcfValuation = calculateDCF(inputs.ebitda, inputs.growthRate, inputs.riskLevel);
    
    // For now, we'll use placeholder comparable values based on EBITDA valuation
    const comparablesValuation = {
        low: ebitdaValuation.low * 0.9,
        high: ebitdaValuation.high * 1.1,
        average: ebitdaValuation.average
    };
    
    // Calculate final valuation range
    const results = {
        low: Math.min(ebitdaValuation.low, dcfValuation.low, comparablesValuation.low),
        high: Math.max(ebitdaValuation.high, dcfValuation.high, comparablesValuation.high),
        ebitdaValuation,
        dcfValuation,
        comparablesValuation
    };
    
    return {
        results,
        recommendations: generateRecommendations(inputs, results)
    };
}

// Form handling
document.getElementById('valuationForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const inputs = {
        revenue: parseFloat(document.getElementById('revenue').value),
        ebitda: parseFloat(document.getElementById('ebitda').value),
        sector: document.getElementById('sector').value,
        growthRate: parseFloat(document.getElementById('growthRate').value),
        riskLevel: document.getElementById('riskLevel').value
    };
    
    const { results, recommendations } = calculateValuation(inputs);
    
    // Update UI with results
    document.getElementById('valuationLow').textContent = formatCurrency(results.low);
    document.getElementById('valuationHigh').textContent = formatCurrency(results.high);
    
    document.getElementById('ebitdaMultiple').querySelector('.value').textContent = 
        formatCurrency(results.ebitdaValuation.average);
    
    document.getElementById('dcf').querySelector('.value').textContent = 
        formatCurrency(results.dcfValuation.average);
    
    document.getElementById('comparables').querySelector('.value').textContent = 
        formatCurrency(results.comparablesValuation.average);
    
    // Update recommendations
    const recommendationsList = document.getElementById('recommendationsList');
    recommendationsList.innerHTML = recommendations
        .map(rec => `<li>${rec}</li>`)
        .join('');
    
    // Show results section
    document.getElementById('resultsSection').style.display = 'block';
}); 