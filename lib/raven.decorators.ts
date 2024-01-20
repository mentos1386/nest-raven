import { SetMetadata } from "@nestjs/common";
import { IRavenScopeTransformerFunction } from "./raven.interfaces";

export const RAVEN_LOCAL_TRANSFORMERS_METADATA = "raven-local-transformers";

export const RavenTransformer = (
  ...transformers: IRavenScopeTransformerFunction[]
) => SetMetadata(RAVEN_LOCAL_TRANSFORMERS_METADATA, transformers);
