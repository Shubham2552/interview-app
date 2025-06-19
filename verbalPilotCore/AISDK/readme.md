InterviewOrganizer (class)
├── IO1 (class)
│   ├── QuestionBuilder (class)
│   │   ├── QB1 (class)
│   │   │   ├── QB1Config1 (e.g., tech: React, topic: Hooks)
│   │   │   
│   │   └── ...
│   ├── FeedbackMaker (class)
│   │   ├── FM1 (class)
│   │   │   ├── FM1Config1
│   │   │ 
│   │   └── ...
│   └── ...
│
└── IO2
    └── ...

QuestionBuilder (class)
├── Uses AIEngine (class)
│   ├── AIE1 (class)
│   │   ├── AIE1Config1
│   │
│   └── ...

FeedbackMaker (class)
├── Uses AIEngine (class)
│   ├── AIE1 (class)
│   └── ...


// 1. Collections of classes with different keys
const QuestionBuilders = {
    QB1: class QB1 { constructor(config) { this.config = config; } },
    QB2: class QB2 { constructor(config) { this.config = config; } }
};

const FeedbackMakers = {
    FM1: class FM1 { constructor(config) { this.config = config; } },
    FM2: class FM2 { constructor(config) { this.config = config; } }
};

// 2. Collections of configs with matching keys to their respective classes
const QBConfigs = {
    QB1Config1: { tech: 'React', topic: 'Hooks' },
    QB2Config1: { tech: 'Node', topic: 'Streams' }
};

const FMConfigs = {
    FM1Config1: { type: 'positive' },
    FM2Config1: { type: 'constructive' }
};

// 3. InterviewOrganizer
class InterviewOrganizer {
    constructor(qbKey, qbConfigKey, fmKey, fmConfigKey) {
        const QBClass = QuestionBuilders[qbKey];
        const FMClass = FeedbackMakers[fmKey];
        this.questionBuilder = new QBClass(QBConfigs[qbConfigKey]);
        this.feedbackMaker = new FMClass(FMConfigs[fmConfigKey]);
    }
}

// Usage
const organizer = new InterviewOrganizer('QB1', 'QB1Config1', 'FM1', 'FM1Config1');
console.log(organizer.questionBuilder.config); // { tech: 'React', topic: 'Hooks' }
console.log(organizer.feedbackMaker.config);   // { type: 'positive' }


InterviewEngine:
    QueryEngine -> QE1(properties, methods)
    InsightEngine -> IE1(properties, methods)
    UserGroupEngine -> UGE1(properties, methods)

1) Method to fetch the eligible interview for users
2) Method to get question
3) Method for response


interview: {
    queryclassconfig(){

    } <- queryobjectconfig

    insightclasscongig(){

    } <- insightobjectconfig

    usergroupconfig90{

    } <- usergroupobjectconfig
}


ClassConfigLoader -> ClassInitializer ->ClassInstanceConfigsLoader ClassInstanceInitializer

ClassInstanceInitializer calls ClassConfigLoader, and ClassInstanceConfigsLoader to get the jsons for configs and then ClassInitializer this is used to create the class object and populate the properties and return the created object

