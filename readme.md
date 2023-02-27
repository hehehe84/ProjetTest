#**Voting.sol Test on Javascript**

##**Intoduction**
Bonjour, merci de prendre du temps pour me corriger.
L'écriture du test (test.js) a parfois été fastidieux et j'ai voulu traiter les cas qui me paraissaient les plus pertinent.

##Initialisation
Pour démarrer la correction, j'ai décidé de mettre en describe.only ma première partie ou : *describe*
Et en describe.skip toutes les autres. Afin de plus facilement passer les parties en describe.skip et celles à tester en describe.only

##**Les constantes**

J'ai créé en début de code toutes les constantes qui me paraissaient essentiel.
Nous avons owner = administrator;
voter et nonvoter.
Petite subtilité, j'ai ajouté 5 autres voter pour les tests sur tallyVotes plus tard

##**Tests**

###*Test de la libraire Owner d'OpenZeppelin*
Simple test pour s'assurer de la bonne tenue du onlyOwner

###*Test du getter getvoter / addVoter / Registration*

Dans cette partie je test les identifiants ainsi que l'enregistrement des voter/nonvoter par l'administrateur.
A la fin de cette partie, je vérifie si l'event VoterRegistered est bien envoyé.

###*Test getter getProposal / Proposals*

Nous vérifions dans cette partie les propositions ajoutées par notre voter.
Nous allons ainsi voir comment les propositions s'ajoutent dans proposals avec 1 et 2 propositions. Nous conjecturons qu'il est alors possible d'implémenter cette logique pour un grand nombre de propositions.
Nous testons aussi les limites de cette partie.
A la fin de cette partie, je vérifie si l'event ProposalRegistered est bien envoyé

###*Test du vote*

Dans cette parie, nous nous basons sur deux propositions d'Id 1 et 2.
Nous testons les limites du système de vote et à la fin, l'event Voted.

###*Test du TallyVotes*

Comme précédemment, nous testons toutes les possibilité des votes en faisant voter les voters que nous avons définit précédemment.
Nous avons aussi introduit une troisième proposition pour aller plus loin dans les limites du dépouillement.

J'ai cependant rencontré une limite quand il s'agissait de faire ressortir l'id Gagnante. Pour contrer celle-ci, j'ai du fouiller dans les résultats de mon terminal et j'ai trouvé une écriture de la forme :👇

*expect(winningId.words[0]).is.equal(X);*

☝️**words[0]** 👈Car c'est de cette syntaxe qui ressort l'id cherché quand nous avons utilisons : *const winningId = await VotingInstance.winningProposalID();*
*cl(winningId) = BN { negative: 0, words: [ X, <1 empty item> ], length: 1, red: null }* => *expect(winningId.words[0]).is.equal(X);* est l'écriture logique pour faire ressortir l'Id gagnante.
Je n'ai pas trouvé de manière plus élégante pour faire ressortir **winningProposalID**

###*Test des States et Events liés*

Dans cette partie, nous testons les variables d'Enum et les évènements qui leurs sont liés de manière chronologique.