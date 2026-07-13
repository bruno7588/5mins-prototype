// 5Mins skill illustrations — full library exported from Figma "Icons/Skill Icon/*"
// (node 9120:10291, downloaded 2026-07-13). 100 skills + 8 "Skill Hugo" alternates.
// Used on skill pages, skill cards, instructor cards, role panels.

import accountPlanning from './account-planning.svg'
import agile from './agile.svg'
import brandDevelopment from './brand-development.svg'
import campaignManagement from './campaign-management.svg'
import cloudComputing from './cloud-computing.svg'
import complianceKnowledge from './compliance-knowledge.svg'
import customerHappiness from './customer-happiness.svg'
import dataAnalysis from './data-analysis.svg'
import digitalMarketing from './digital-marketing.svg'
import employeeEngagement from './employee-engagement.svg'
import financialAccounting from './financial-accounting.svg'
import negotiation from './negotiation.svg'
import operationsManagement from './operations-management.svg'
import peopleManagement from './people-management.svg'
import pricingStrategy from './pricing-strategy.svg'
import programming from './programming.svg'
import salesProcess from './sales-process.svg'
import softwareDesign from './software-design.svg'
import storytelling from './storytelling.svg'
import strategicCommunications from './strategic-communications.svg'
import accountBasedMarketing from './account-based-marketing.svg'
import activeListening from './active-listening.svg'
import adminManagement from './admin-management.svg'
import affiliateMarketing from './affiliate-marketing.svg'
import automationTestingAndDeployment from './automation-testing-and-deployment.svg'
import backendFrameworks from './backend-frameworks.svg'
import businessDevelopment from './business-development.svg'
import changeManagement from './change-management.svg'
import coachingAndFeedback from './coaching-and-feedback.svg'
import commercialAcumen from './commercial-acumen.svg'
import contentCreation from './content-creation.svg'
import conversionOptimisation from './conversion-optimisation.svg'
import cryptography from './cryptography.svg'
import customerSupport from './customer-support.svg'
import dataModelingAndVisualisation from './data-modeling-and-visualisation.svg'
import dataSciencePrinciples from './data-science-principles.svg'
import dataTools from './data-tools.svg'
import devopsTools from './devops-tools.svg'
import emailMarketing from './email-marketing.svg'
import entrepreneurialThinking from './entrepreneurial-thinking.svg'
import eventManagement from './event-management.svg'
import financialAnalysisAndModelling from './financial-analysis-and-modelling.svg'
import financialOperations from './financial-operations.svg'
import frontEndFrameworks from './front-end-frameworks.svg'
import graphicAndDigitalDesign from './graphic-and-digital-design.svg'
import itNetworking from './it-networking.svg'
import learningProgramDesignAndDelivery from './learning-program-design-and-delivery.svg'
import machineLearning from './machine-learning.svg'
import managementAccounting from './management-accounting.svg'
import marketAndCustomerResearch from './market-and-customer-research.svg'
import marketingAutomation from './marketing-automation.svg'
import marketingStrategy from './marketing-strategy.svg'
import mathematicsAndStatistics from './mathematics-and-statistics.svg'
import mobileMarketing from './mobile-marketing.svg'
import networkSecurity from './network-security.svg'
import operationsPlanningAndAnalysis from './operations-planning-and-analysis.svg'
import organisationalDesignAndDevelopment from './organisational-design-and-development.svg'
import payPerClickAdvertising from './pay-per-click-advertising.svg'
import performanceManagement from './performance-management.svg'
import productDiscoveryAndDevelopment from './product-discovery-and-development.svg'
import projectManagement from './project-management.svg'
import publicRelations from './public-relations.svg'
import recruitmentAndRetention from './recruitment-and-retention.svg'
import revenueOperations from './revenue-operations.svg'
import riskManagement from './risk-management.svg'
import searchEngineOptimisation from './search-engine-optimisation.svg'
import socialMediaMarketing from './social-media-marketing.svg'
import softwareSpecification from './software-specification.svg'
import softwareTestingAndDevelopment from './software-testing-and-development.svg'
import solutionSelling from './solution-selling.svg'
import technicalMarketing from './technical-marketing.svg'
import uxDesignAndDevelopment from './ux-design-and-development.svg'
import uxUiResearch from './ux-ui-research.svg'
import videoEditing from './video-editing.svg'
import viralReferralMarketing from './viral-referral-marketing.svg'
import questioningAndDiscovery from './questioning-and-discovery.svg'
import closingAndObjectionHandling from './closing-and-objection-handling.svg'
import customerExperience from './customer-experience.svg'
import dataPrivacy from './data-privacy.svg'
import productStrategy from './product-strategy.svg'
import workplaceCulture from './workplace-culture.svg'
import diversityEquityAndInclusion from './diversity-equity-and-inclusion.svg'
import dataAndSecurityCompliance from './data-and-security-compliance.svg'
import workplaceCompliance from './workplace-compliance.svg'
import esg from './esg.svg'
import financialCompliance from './financial-compliance.svg'
import sustainability from './sustainability.svg'
import buyerPsychology from './buyer-psychology.svg'
import talentAcquisitionTechniques from './talent-acquisition-techniques.svg'
import legalTechnologies from './legal-technologies.svg'
import generativeAi from './generative-ai.svg'
import personalBranding from './personal-branding.svg'
import linkedin from './linkedin.svg'
import daxtra from './daxtra.svg'
import clickdimensions from './clickdimensions.svg'
import mercury from './mercury.svg'
import searchability from './searchability.svg'
import jobAdvertising from './job-advertising.svg'
import resourcing from './resourcing.svg'
import fiveMinsCompliance from './5mins-compliance.svg'
import automationTestingAndDeploymentHugo from './automation-testing-and-deployment-hugo.svg'
import financialComplianceHugo from './financial-compliance-hugo.svg'
import dataAndSecurityComplianceHugo from './data-and-security-compliance-hugo.svg'
import workplaceComplianceHugo from './workplace-compliance-hugo.svg'
import esgHugo from './esg-hugo.svg'
import sustainabilityHugo from './sustainability-hugo.svg'
import buyerPsychologyHugo from './buyer-psychology-hugo.svg'
import generativeAiHugo from './generative-ai-hugo.svg'

// Legacy 20-item pool — keep untouched so existing getSkillIllustration(skillId)
// call sites (roles pages) keep resolving to the same images.
export const skillIllustrations = [
  accountPlanning,
  agile,
  brandDevelopment,
  campaignManagement,
  cloudComputing,
  complianceKnowledge,
  customerHappiness,
  dataAnalysis,
  digitalMarketing,
  employeeEngagement,
  financialAccounting,
  negotiation,
  operationsManagement,
  peopleManagement,
  pricingStrategy,
  programming,
  salesProcess,
  softwareDesign,
  storytelling,
  strategicCommunications,
]

export function getSkillIllustration(skillId: number): string {
  return skillIllustrations[skillId % skillIllustrations.length]
}

// Full library keyed by the official skill name (Figma "Icons/Skill Icon/<name>").
export const skillIllustrationByName: Record<string, string> = {
  'Account Planning': accountPlanning,
  'Account-Based Marketing': accountBasedMarketing,
  'Active Listening': activeListening,
  'Admin Management': adminManagement,
  'Affiliate Marketing': affiliateMarketing,
  'Agile Methodologies': agile,
  'Automation Testing & Deployment': automationTestingAndDeployment,
  'Backend Frameworks': backendFrameworks,
  'Brand Development': brandDevelopment,
  'Business Development': businessDevelopment,
  'Campaign Management': campaignManagement,
  'Change Management': changeManagement,
  'Cloud Computing': cloudComputing,
  'Coaching & Feedback': coachingAndFeedback,
  'Commercial Acumen': commercialAcumen,
  'Compliance Knowledge': complianceKnowledge,
  'Content Creation': contentCreation,
  'Conversion Optimisation': conversionOptimisation,
  'Cryptography': cryptography,
  'Customer Happiness': customerHappiness,
  'Customer Support': customerSupport,
  'Data Analysis & Reporting': dataAnalysis,
  'Data Modeling & Visualisation': dataModelingAndVisualisation,
  'Data Science Principles': dataSciencePrinciples,
  'Data Tools': dataTools,
  'DevOps Tools': devopsTools,
  'Digital Marketing Concepts': digitalMarketing,
  'Email Marketing': emailMarketing,
  'Employee Engagement': employeeEngagement,
  'Entrepreneurial Thinking': entrepreneurialThinking,
  'Event Management': eventManagement,
  'Financial Accounting': financialAccounting,
  'Financial Analysis & Modelling': financialAnalysisAndModelling,
  'Financial Operations': financialOperations,
  'Front End Frameworks': frontEndFrameworks,
  'Graphic & Digital Design': graphicAndDigitalDesign,
  'It Networking': itNetworking,
  'Learning Program Design & Delivery': learningProgramDesignAndDelivery,
  'Machine Learning': machineLearning,
  'Management Accounting': managementAccounting,
  'Market & Customer Research': marketAndCustomerResearch,
  'Marketing Automation': marketingAutomation,
  'Marketing Strategy': marketingStrategy,
  'Mathematics & Statistics': mathematicsAndStatistics,
  'Mobile Marketing': mobileMarketing,
  'Negotiation': negotiation,
  'Network Security': networkSecurity,
  'Operations Management': operationsManagement,
  'Operations Planning and Analysis': operationsPlanningAndAnalysis,
  'Organisational Design & Development': organisationalDesignAndDevelopment,
  'Pay Per Click Advertising': payPerClickAdvertising,
  'People Management': peopleManagement,
  'Performance Management': performanceManagement,
  'Pricing Strategy': pricingStrategy,
  'Product Discovery & Development': productDiscoveryAndDevelopment,
  'Programming': programming,
  'Project Management': projectManagement,
  'Public Relations': publicRelations,
  'Recruitment & Retention': recruitmentAndRetention,
  'Revenue Operations': revenueOperations,
  'Risk Management': riskManagement,
  'Sales Process': salesProcess,
  'Search Engine Optimisation': searchEngineOptimisation,
  'Social Media Marketing': socialMediaMarketing,
  'Software Design': softwareDesign,
  'Software Specification': softwareSpecification,
  'Software Testing & Development': softwareTestingAndDevelopment,
  'Solution Selling': solutionSelling,
  'Storytelling': storytelling,
  'Strategic Communications': strategicCommunications,
  'Technical Marketing': technicalMarketing,
  'UX Design and Development': uxDesignAndDevelopment,
  'UX UI Research': uxUiResearch,
  'Video Editing': videoEditing,
  'Viral Referral Marketing': viralReferralMarketing,
  'Questioning and Discovery': questioningAndDiscovery,
  'Closing and Objection Handling': closingAndObjectionHandling,
  'Customer Experience': customerExperience,
  'Data Privacy': dataPrivacy,
  'Product Strategy': productStrategy,
  'Workplace Culture': workplaceCulture,
  'Diversity, Equity and Inclusion': diversityEquityAndInclusion,
  'Data & Security Compliance': dataAndSecurityCompliance,
  'Workplace Compliance': workplaceCompliance,
  'ESG': esg,
  'Financial Compliance': financialCompliance,
  'Sustainability': sustainability,
  'Buyer Psychology': buyerPsychology,
  'Talent Acquisition Techniques': talentAcquisitionTechniques,
  'Legal Technologies': legalTechnologies,
  'Generative ai': generativeAi,
  'Personal Branding': personalBranding,
  'LinkedIn': linkedin,
  'DaXtra': daxtra,
  'ClickDimensions': clickdimensions,
  'Mercury': mercury,
  'Searchability': searchability,
  'Job advertising': jobAdvertising,
  'Resourcing': resourcing,
  '5Mins Compliance': fiveMinsCompliance,
}

// Alternate "Skill Hugo" illustration style (Figma "Illustrations/Skill Hugo/<name>"),
// available for 8 skills only.
export const skillIllustrationHugoByName: Record<string, string> = {
  'Automation Testing & Deployment': automationTestingAndDeploymentHugo,
  'Financial Compliance': financialComplianceHugo,
  'Data & Security Compliance': dataAndSecurityComplianceHugo,
  'Workplace Compliance': workplaceComplianceHugo,
  'ESG': esgHugo,
  'Sustainability': sustainabilityHugo,
  'Buyer Psychology': buyerPsychologyHugo,
  'Generative ai': generativeAiHugo,
}

export const allSkillIllustrations = Object.values(skillIllustrationByName)

/** Case-insensitive, whitespace-tolerant lookup; falls back to a stable hash pick. */
export function getSkillIllustrationByName(name: string): string {
  const trimmed = name.trim()
  const direct = skillIllustrationByName[trimmed]
  if (direct) return direct
  const lower = trimmed.toLowerCase()
  for (const [key, value] of Object.entries(skillIllustrationByName)) {
    if (key.toLowerCase() === lower) return value
  }
  let hash = 0
  for (let i = 0; i < lower.length; i++) hash = (hash * 31 + lower.charCodeAt(i)) | 0
  return allSkillIllustrations[Math.abs(hash) % allSkillIllustrations.length]
}
