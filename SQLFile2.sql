CREATE TABLE CompanyName(
	CompanyNameID int PRIMARY KEY,
	CompanyName VARCHAR (50),
	CreatedBy VARCHAR(100),
    createdDate DATETIME DEFAULT GETDATE(),
    lastUpdatedBy VARCHAR(100),
    lastUpdatedDate DATETIME
	);

CREATE TABLE ContractType (
	ContractTypeID INT PRIMARY KEY,
	CompanyNameID INT, 
	ContractType VARCHAR,
	CreatedBy VARCHAR(100),
    createdDate DATETIME DEFAULT GETDATE(),
    lastUpdatedBy VARCHAR(100),
    lastUpdatedDate DATETIME
	FOREIGN KEY (CompanyNameID) REFERENCES CompanyName(CompanyNameID)
	);

CREATE TABLE EmploymentContract(
	EmploymentContractID INT PRIMARY KEY(1,1),
	ContractCreateDate DATETIME NOT NULL,
	CompanyNameID INT,
	CompanyName VARCHAR,
	ContractTypeID INT,
	ContractType VARCHAR,
	Surname VARCHAR,
	Firstname VARCHAR,
	IdentificationType  varchar,
	identitynumber int,
	PassportNumber int,
	IDValue int,
	JobTitle Varchar,
	Department varchar,
	Branch VARCHAR(100),
    Remuneration DECIMAL(18,2),
    ContractStartDate DATE,
    ContractEndDate DATE,
    ContractStatus VARCHAR(50),
    ProjectDetail VARCHAR(MAX),
    CreatedBy VARCHAR(100),
    createdDate DATETIME DEFAULT GETDATE(),
    lastUpdatedBy VARCHAR(100),
    lastUpdatedDate DATETIME,
	FOREIGN KEY (CompanyNameID) REFERENCES CompanyName(CompanyNameID),
	FOREIGN KEY (ContractTypeID) REFERENCES ContractType(ContractTypeID)
);

CREATE TABLE ApprovedContracts(
	fileID int primary key identity (1,1),
	EmploymentContractID INT NOT NULL,
    FileName VARCHAR(255) NOT NULL,
    createdBy VARCHAR(100),
    createdDate DATETIME DEFAULT GETDATE(),
    lastUpdatedBy VARCHAR(100),
    lastUpdatedDate DATETIME,
    FOREIGN KEY (EmploymentContractID) REFERENCES EmploymentContract(EmploymentContractID)
);

CREATE TABLE WarningTypes (
	WarningTypeID int primary key identity (1,1),
	WarningType VARCHAR (100)
);

CREATE TABLE CoCoffences(
	CoCID int primary key identity (1,1),
	CoCoffence VARCHAR (300),
	CreatedBy VARCHAR(100),
    createdDate DATETIME DEFAULT GETDATE(),
    lastUpdatedBy VARCHAR(100),
    lastUpdatedDate DATETIME,
);

CREATE TABLE SignedWarnings(
	fileID int primary key identity (1,1),
	WarningID int,
	FileName VARCHAR(255) NOT NULL,
	CreatedBy VARCHAR(100),
    createdDate DATETIME DEFAULT GETDATE(),
    lastUpdatedBy VARCHAR(100),
    lastUpdatedDate DATETIME,
);


CREATE TABLE EmploymentConfirmationLetter (
    EmploymentConfirmationLetterID INT PRIMARY KEY IDENTITY(1,1),
    PersonnelNumber VARCHAR(50) NOT NULL,
    Name VARCHAR(100),
    Surname VARCHAR(100),
    IDType VARCHAR(50),
    IDValue VARCHAR(50),
    CompanyCode VARCHAR(50),
    CompanyName VARCHAR(255),
    JobTitle VARCHAR(100),
    Department VARCHAR(100),
    EmploymentStartDate DATE,
	EmploymentEndDate DATE,
    createdBy VARCHAR(100),
    createdDate DATETIME DEFAULT GETDATE(),
    lastUpdatedBy VARCHAR(100),
    lastUpdatedDate DATETIME
);

CREATE TABLE MaternityAgreement (
    MaternityAgreementID INT PRIMARY KEY IDENTITY(1,1),
    confirmationLetterID INT NOT NULL,
    PersonnelNumber VARCHAR(50) NOT NULL,
    Name VARCHAR(100),
    Surname VARCHAR(100),
    IDType VARCHAR(50),
    IDValue VARCHAR(50),
    CompanyCode VARCHAR(50),
    CompanyName VARCHAR(255),
    JobTitle VARCHAR(100),
    Department VARCHAR(100),
    MaternityStartDate DATE,
    MaternityEndDate DATE,
    Percentage DECIMAL(5,2),
    dirName VARCHAR(255),
    createdBy VARCHAR(100),
    createdDate DATETIME DEFAULT GETDATE(),
    lastUpdatedBy VARCHAR(100),
    lastUpdatedDate DATETIME,
    FOREIGN KEY (confirmationLetterID) REFERENCES EmploymentConfirmationLetter(EmploymentConfirmationLetterID)
);


CREATE TABLE DisciplinaryStatus (
    DisciplinaryStatusID INT PRIMARY KEY IDENTITY(1,1),
    RowID INT NOT NULL,
    personnelNumber VARCHAR(50) NOT NULL,
    NotesAddress VARCHAR(255),
    DisciplinaryStatus VARCHAR(100),
    createdBy VARCHAR(100),
    createdDate DATETIME DEFAULT GETDATE(),
    lastUpdatedBy VARCHAR(100),
    lastUpdatedDate DATETIME,
    FOREIGN KEY (RowID) REFERENCES EmploymentContract(EmploymentContractID)
);

CREATE TABLE ContextMemory (
    ContextID INT PRIMARY KEY IDENTITY(1,1),
    UserID VARCHAR(50) NOT NULL,
    ContextType VARCHAR(50),       -- e.g., 'Preference', 'RecentAction'
    ContextKey VARCHAR(100),       -- e.g., 'humor_level', 'last_contract'
    ContextValue VARCHAR(MAX),     -- e.g., 'high', 'EmploymentContractID=12'
    LastUpdated DATETIME DEFAULT GETDATE()
);

INSERT INTO CompanyName (CompanyNameID, CompanyName, CreatedBy)
VALUES (1, 'TechCorp', 'Michelle Muller');


INSERT INTO ContractType (ContractTypeID, CompanyNameID, ContractType, CreatedBy)
VALUES (1, 1, 'Permanent', 'Michelle Muller');

INSERT INTO EmploymentContract (
    EmploymentContractID, ContractCreateDate, CompanyNameID, ContractTypeID,
    Surname, Firstname, IdentificationType, identitynumber, JobTitle, Department,
    Branch, Remuneration, ContractStartDate, ContractEndDate, ContractStatus, ProjectDetail, CreatedBy
)
VALUES (
    1, GETDATE(), 1, 1,
    'Doe', 'John', 'ID', 123456789, 'Software Engineer', 'IT',
    'Main Branch', 75000.00, '2025-01-01', '2026-01-01', 'Active', 'Project Alpha', 'Michelle Muller'
);

UPDATE EmploymentContract
SET lastUpdatedBy = 'Michelle Muller', lastUpdatedDate = GETDATE()


INSERT INTO ContextMemory (UserID, ContextType, ContextKey, ContextValue)
VALUES ('123', 'Trigger', 'stress', 'Take a deep breath. Or better yet, let me handle it.');
