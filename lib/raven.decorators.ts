import { IRavenScopeTransformerFunction } from './raven.interfaces';
import { SetMetadata } from '@nestjs/common';

export const RAVEN_LOCAL_TRANSFORMERS_METADATA = 'raven-local-transformers';

export const RavenTransformer = (
  ...transformers: IRavenScopeTransformerFunction[]
) => SetMetadata(RAVEN_LOCAL_TRANSFORMERS_METADATA, transformers);
