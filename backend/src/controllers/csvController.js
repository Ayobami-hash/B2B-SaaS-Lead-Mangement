const Lead = require('../models/lead.model');
const Company = require('../models/company.model');

const calculateTrustScore = (date) => {
  const today = new Date();
  const lastUpdateDate = new Date(date);
  const timeDiff = Math.abs(today - lastUpdateDate);
  const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  return Math.max(0, 100 - daysDiff);
};

const processCSVData = async (csvData, fieldMappings) => {
  let recordsCreated = 0;
  let recordsUpdated = 0;
  let errors = 0;

  for (const row of csvData) {
    try {
      const leadData = {
        linkedInUrl: row[fieldMappings['LinkedIn Url']],
        firstName: row[fieldMappings['First Name']],
        lastName: row[fieldMappings['Last Name']],
        email: row[fieldMappings['Email']],
        companyId: null,  // This will be set after finding or creating the company
      };

      const companyData = {
        name: row[fieldMappings['Company Name']],
        linkedInUrl: row[fieldMappings['Company Linkedin Url']],
        website: row[fieldMappings['Company Website']],
        phone: row[fieldMappings['Phone numbers']],
      };

      const trustScore = calculateTrustScore(row[fieldMappings['Last Updated']]);

      let existingCompany = await Company.findOne({ linkedInUrl: companyData.linkedInUrl });

      if (!existingCompany) {
        existingCompany = await Company.create(companyData);
      } else {
        await Company.updateOne({ _id: existingCompany._id }, { $set: companyData });
      }

      leadData.companyId = existingCompany._id;

      const existingLead = await Lead.findOne({
        $or: [{ email: leadData.email }, { linkedInUrl: leadData.linkedInUrl }],
      });

      if (existingLead) {
        await Lead.updateOne({ _id: existingLead._id }, { $set: { ...leadData, trustScore } });
        recordsUpdated++;
      } else {
        await Lead.create({ ...leadData, trustScore });
        recordsCreated++;
      }
    } catch (error) {
      console.error('Error processing row:', error);
      errors++;
    }
  }

  return { recordsCreated, recordsUpdated, errors };
};

module.exports = { processCSVData };
