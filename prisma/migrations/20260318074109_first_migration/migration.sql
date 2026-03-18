-- CreateTable
CREATE TABLE "Configuration" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Configuration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VmSchedule" (
    "id" SERIAL NOT NULL,
    "vmUuid" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "cronExpression" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Jakarta',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VmSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppClient" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppClient_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Configuration_key_key" ON "Configuration"("key");

-- CreateIndex
CREATE UNIQUE INDEX "VmSchedule_vmUuid_action_key" ON "VmSchedule"("vmUuid", "action");

-- CreateIndex
CREATE UNIQUE INDEX "AppClient_apiKey_key" ON "AppClient"("apiKey");
