-- Add workflow builder storage tables.
CREATE TABLE IF NOT EXISTS "WorkflowDefinition" (
  "id" SERIAL NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL DEFAULT '',
  "currentVersion" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WorkflowDefinition_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "WorkflowDefinition_name_key" ON "WorkflowDefinition"("name");

CREATE TABLE IF NOT EXISTS "WorkflowVersion" (
  "id" SERIAL NOT NULL,
  "workflowDefinitionId" INTEGER NOT NULL,
  "version" INTEGER NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL DEFAULT '',
  "status" TEXT NOT NULL DEFAULT 'saved',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WorkflowVersion_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "WorkflowVersion_workflowDefinitionId_version_key" ON "WorkflowVersion"("workflowDefinitionId", "version");

ALTER TABLE "WorkflowVersion"
  ADD CONSTRAINT "WorkflowVersion_workflowDefinitionId_fkey"
  FOREIGN KEY ("workflowDefinitionId") REFERENCES "WorkflowDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "WorkflowNode" (
  "id" SERIAL NOT NULL,
  "workflowVersionId" INTEGER NOT NULL,
  "nodeKey" TEXT NOT NULL,
  "nodeType" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "actionDefinitionId" INTEGER,
  "positionX" INTEGER NOT NULL DEFAULT 0,
  "positionY" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WorkflowNode_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "WorkflowNode_workflowVersionId_nodeKey_key" ON "WorkflowNode"("workflowVersionId", "nodeKey");

ALTER TABLE "WorkflowNode"
  ADD CONSTRAINT "WorkflowNode_workflowVersionId_fkey"
  FOREIGN KEY ("workflowVersionId") REFERENCES "WorkflowVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "WorkflowNode"
  ADD CONSTRAINT "WorkflowNode_actionDefinitionId_fkey"
  FOREIGN KEY ("actionDefinitionId") REFERENCES "ActionSchema"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "WorkflowEdge" (
  "id" SERIAL NOT NULL,
  "workflowVersionId" INTEGER NOT NULL,
  "fromNodeKey" TEXT NOT NULL,
  "toNodeKey" TEXT NOT NULL,
  "label" TEXT NOT NULL DEFAULT '',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WorkflowEdge_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "WorkflowEdge_workflowVersionId_idx" ON "WorkflowEdge"("workflowVersionId");

ALTER TABLE "WorkflowEdge"
  ADD CONSTRAINT "WorkflowEdge_workflowVersionId_fkey"
  FOREIGN KEY ("workflowVersionId") REFERENCES "WorkflowVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
