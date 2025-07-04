AIService 
QueryService <- AIService

Tables

Template: id content propertyList name displayName description

PropertyValues: id values templateId name displayName description

QueryServiceConfig: id AIEngineType TemplateId responseStructureId PropertyValuesId name displayName description partialProperties allProperties

ResponseStructures: id responseStructure templateId 

InterviewConfig: 
id,
QueryAIEngine,
QueryTemplate,
QueryProperties,
ResponseTemplate,
ResponseAIEngine,


InterviewGroupMapping: id groupId InterviewConfigId

UserGroups: id name displayName description

UsersGroupsMapping: id userId groupId

Users: id firstName lastName email mobile dateOfBirth 

UserPermissionsMapping: id userId permissionId

UserPermissions: id name displayName description 


Main Configurations:

AI
Questions
Feedbacks
UserGroup


InterviewConfig:-
Query:-
aiengine
responsestructure
values

Feedback:-
feedbackprompt
responseschema

UserGroup:-


