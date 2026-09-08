/**
 * block type -> component registry.
 *
 * The keys are exhaustive over the discriminated union in content.config.ts:
 * adding a block type to the schema without adding a component here is a
 * TypeScript error, and an unknown type at runtime throws in ContentPage.astro.
 */
import type { PageBlockType } from '../../content.config.ts';

import ApproachBlock from './ApproachBlock.astro';
import CapabilitiesBlock from './CapabilitiesBlock.astro';
import ConsultationBlock from './ConsultationBlock.astro';
import ContactBlock from './ContactBlock.astro';
import DeploymentBlock from './DeploymentBlock.astro';
import EventsBlock from './EventsBlock.astro';
import ExperienceBlock from './ExperienceBlock.astro';
import FeaturesBlock from './FeaturesBlock.astro';
import FlowBlock from './FlowBlock.astro';
import ModelsBlock from './ModelsBlock.astro';
import NewsBlock from './NewsBlock.astro';
import ProductsBlock from './ProductsBlock.astro';
import ScreenshotsBlock from './ScreenshotsBlock.astro';
import SelectionBlock from './SelectionBlock.astro';
import ServicesBlock from './ServicesBlock.astro';
import SocialBlock from './SocialBlock.astro';
import SupportingBlock from './SupportingBlock.astro';
import TeamBlock from './TeamBlock.astro';
import TechnologyBlock from './TechnologyBlock.astro';
import UseCasesBlock from './UseCasesBlock.astro';
import VisionBlock from './VisionBlock.astro';

export const BLOCK_COMPONENTS = {
  approach: ApproachBlock,
  capabilities: CapabilitiesBlock,
  consultation: ConsultationBlock,
  contact: ContactBlock,
  deployment: DeploymentBlock,
  events: EventsBlock,
  experience: ExperienceBlock,
  features: FeaturesBlock,
  flow: FlowBlock,
  models: ModelsBlock,
  news: NewsBlock,
  products: ProductsBlock,
  screenshots: ScreenshotsBlock,
  selection: SelectionBlock,
  services: ServicesBlock,
  social: SocialBlock,
  supporting: SupportingBlock,
  team: TeamBlock,
  technology: TechnologyBlock,
  useCases: UseCasesBlock,
  vision: VisionBlock,
} satisfies Record<PageBlockType, unknown>;
