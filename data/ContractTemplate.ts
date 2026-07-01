export interface DealDetails {
  parties: {
    sideA: string;
    sideB: string;
  };
  payment: {
    amount: string;
    currency: string;
    terms: string;
  };
  deadline: string;
  scope: string;
  location?: string;
}

export const generateContractBody = (details: DealDetails) => {
  const { parties, payment, deadline, scope, location = 'India' } = details;
  
  return `
SERVICE AGREEMENT

This Service Agreement (the "Agreement") is entered into as of ${new Date().toLocaleDateString()}, by and between:

${parties.sideA.toUpperCase()} ("Client")
AND
${parties.sideB.toUpperCase()} ("Service Provider")

1. SCOPE OF SERVICES
The Service Provider agrees to perform the following services for the Client:
${scope}

2. PAYMENT TERMS
In consideration for the services provided, the Client shall pay the Service Provider the sum of ${payment.amount} ${payment.currency}.
Payment Schedule: ${payment.terms}

3. DEADLINE & COMPLETION
The Services shall be completed and delivered to the Client on or before ${deadline}.

4. CONFIDENTIALITY
Each Party agrees to maintain the confidentiality of all proprietary information exchanged during the term of this Agreement.

5. GOVERNING LAW
This Agreement shall be governed by and construed in accordance with the laws of ${location}.

6. ENTIRE AGREEMENT
This document constitutes the entire agreement between the parties and supersedes any prior oral or written agreements.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first above written.

__________________________          __________________________
Client Signature                     Service Provider Signature
  `.trim();
};
