-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "institution" TEXT,
    "country" TEXT,
    "website" TEXT,
    "pi" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Source" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kind" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT,
    "doi" TEXT,
    "authors" TEXT,
    "year" INTEGER,
    "venue" TEXT,
    "licenseName" TEXT,
    "licenseUrl" TEXT,
    "repositoryType" TEXT,
    "abstractText" TEXT,
    "reviewStatus" TEXT DEFAULT 'none',
    "lastCheckedAt" DATETIME,
    "organizationId" TEXT,
    "metadataJson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Source_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Dataset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceId" TEXT,
    "organizationId" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "modality" TEXT,
    "accessStatus" TEXT NOT NULL DEFAULT 'unknown',
    "licenseName" TEXT,
    "licenseUrl" TEXT,
    "rawDataAvailable" BOOLEAN NOT NULL DEFAULT false,
    "processedDataAvailable" BOOLEAN NOT NULL DEFAULT false,
    "metadataAvailable" BOOLEAN NOT NULL DEFAULT false,
    "codeAvailable" BOOLEAN NOT NULL DEFAULT false,
    "dataUrl" TEXT,
    "externalId" TEXT,
    "sizeBytes" BIGINT,
    "nRecordings" INTEGER,
    "lastCheckedAt" DATETIME,
    "verificationStatus" TEXT NOT NULL DEFAULT 'draft',
    "limitations" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Dataset_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Dataset_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DatasetFile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "datasetId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "format" TEXT,
    "sizeBytes" BIGINT,
    "checksumSha256" TEXT,
    "url" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DatasetFile_datasetId_fkey" FOREIGN KEY ("datasetId") REFERENCES "Dataset" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OrganoidPreparation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "cellLine" TEXT,
    "protocolReference" TEXT,
    "brainRegion" TEXT,
    "divRange" TEXT,
    "mediaComposition" TEXT,
    "notes" TEXT,
    "sourceId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "RecordingSetup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "platform" TEXT,
    "channelCount" INTEGER,
    "samplingRateHz" INTEGER,
    "spikeSorter" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "StimulationProtocol" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "waveform" TEXT,
    "amplitudeUa" REAL,
    "frequencyHz" REAL,
    "pulseWidthUs" REAL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "BenchmarkTrack" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "rationale" TEXT,
    "scoringFormula" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "trackId" TEXT NOT NULL,
    "requiredInputs" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Task_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "BenchmarkTrack" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Metric" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "unit" TEXT,
    "direction" TEXT NOT NULL DEFAULT 'higher_better',
    "trackId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Metric_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "BenchmarkTrack" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MethodologyVersion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "version" TEXT NOT NULL,
    "releasedAt" DATETIME NOT NULL,
    "summary" TEXT,
    "changelog" TEXT,
    "formulaJson" TEXT,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "System" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sourceId" TEXT,
    "datasetId" TEXT,
    "organizationId" TEXT,
    "organoidPreparationId" TEXT,
    "recordingSetupId" TEXT,
    "stimulationProtocolId" TEXT,
    "taskId" TEXT,
    "verificationStatus" TEXT NOT NULL DEFAULT 'draft',
    "limitations" TEXT,
    "submissionId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "System_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "System_datasetId_fkey" FOREIGN KEY ("datasetId") REFERENCES "Dataset" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "System_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "System_organoidPreparationId_fkey" FOREIGN KEY ("organoidPreparationId") REFERENCES "OrganoidPreparation" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "System_recordingSetupId_fkey" FOREIGN KEY ("recordingSetupId") REFERENCES "RecordingSetup" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "System_stimulationProtocolId_fkey" FOREIGN KEY ("stimulationProtocolId") REFERENCES "StimulationProtocol" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "System_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "System_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BenchmarkRun" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "systemId" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "taskId" TEXT,
    "methodologyVersionId" TEXT,
    "nOrganoids" INTEGER,
    "nSessions" INTEGER,
    "nBatches" INTEGER,
    "nLabs" INTEGER,
    "runStatus" TEXT NOT NULL DEFAULT 'draft',
    "dataCompletenessScore" REAL,
    "notes" TEXT,
    "runDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BenchmarkRun_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "System" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BenchmarkRun_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "BenchmarkTrack" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BenchmarkRun_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "BenchmarkRun_methodologyVersionId_fkey" FOREIGN KEY ("methodologyVersionId") REFERENCES "MethodologyVersion" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MetricValue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "benchmarkRunId" TEXT NOT NULL,
    "metricId" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "normalizedValue" REAL,
    "ciLow" REAL,
    "ciHigh" REAL,
    "ciMethod" TEXT,
    "derivationMethod" TEXT NOT NULL,
    "derivationNotes" TEXT,
    "sourceId" TEXT,
    "codeVersion" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MetricValue_benchmarkRunId_fkey" FOREIGN KEY ("benchmarkRunId") REFERENCES "BenchmarkRun" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MetricValue_metricId_fkey" FOREIGN KEY ("metricId") REFERENCES "Metric" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MetricValue_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Control" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "RunControl" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "benchmarkRunId" TEXT NOT NULL,
    "controlId" TEXT NOT NULL,
    "passed" BOOLEAN,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RunControl_benchmarkRunId_fkey" FOREIGN KEY ("benchmarkRunId") REFERENCES "BenchmarkRun" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RunControl_controlId_fkey" FOREIGN KEY ("controlId") REFERENCES "Control" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ScoreCalculation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "benchmarkRunId" TEXT NOT NULL,
    "methodologyVersionId" TEXT NOT NULL,
    "scoreType" TEXT NOT NULL,
    "score" REAL,
    "confidenceGrade" TEXT,
    "calculationJson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ScoreCalculation_benchmarkRunId_fkey" FOREIGN KEY ("benchmarkRunId") REFERENCES "BenchmarkRun" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ScoreCalculation_methodologyVersionId_fkey" FOREIGN KEY ("methodologyVersionId") REFERENCES "MethodologyVersion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProvenanceEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventType" TEXT NOT NULL,
    "message" TEXT,
    "actor" TEXT,
    "sourceId" TEXT,
    "systemId" TEXT,
    "datasetId" TEXT,
    "benchmarkRunId" TEXT,
    "payloadJson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProvenanceEvent_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ProvenanceEvent_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "System" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProvenanceEvent_datasetId_fkey" FOREIGN KEY ("datasetId") REFERENCES "Dataset" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProvenanceEvent_benchmarkRunId_fkey" FOREIGN KEY ("benchmarkRunId") REFERENCES "BenchmarkRun" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "submitterEmail" TEXT NOT NULL,
    "submitterName" TEXT,
    "organizationId" TEXT,
    "proposedSystemName" TEXT NOT NULL,
    "proposedTrackSlug" TEXT,
    "proposedTaskSlug" TEXT,
    "sourceUrl" TEXT,
    "datasetUrl" TEXT,
    "codeUrl" TEXT,
    "payloadJson" TEXT NOT NULL,
    "reviewStatus" TEXT NOT NULL DEFAULT 'received',
    "reviewerNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Submission_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_name_key" ON "Organization"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Source_doi_key" ON "Source"("doi");

-- CreateIndex
CREATE UNIQUE INDEX "Dataset_slug_key" ON "Dataset"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "OrganoidPreparation_slug_key" ON "OrganoidPreparation"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "RecordingSetup_slug_key" ON "RecordingSetup"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "StimulationProtocol_slug_key" ON "StimulationProtocol"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "BenchmarkTrack_slug_key" ON "BenchmarkTrack"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Task_slug_key" ON "Task"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Metric_slug_key" ON "Metric"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "MethodologyVersion_version_key" ON "MethodologyVersion"("version");

-- CreateIndex
CREATE UNIQUE INDEX "System_slug_key" ON "System"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "System_submissionId_key" ON "System"("submissionId");

-- CreateIndex
CREATE UNIQUE INDEX "Control_slug_key" ON "Control"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "RunControl_benchmarkRunId_controlId_key" ON "RunControl"("benchmarkRunId", "controlId");

-- CreateIndex
CREATE UNIQUE INDEX "ScoreCalculation_benchmarkRunId_methodologyVersionId_scoreType_key" ON "ScoreCalculation"("benchmarkRunId", "methodologyVersionId", "scoreType");
