const Voting = artifacts.require("../contracts/Voting.sol");
const {BN, expectRevert, expectEvent} = require('@openzeppelin/test-helpers');
const {expect} = require('chai');

contract('Voting', async (accounts) => {
    
    const administrator = accounts[0];
    const voter = accounts[1];
    const nonvoter = accounts[2];
    const voter2 = accounts[3];
    const voter3 = accounts[4];
    const voter4 = accounts[5];
    const voter5 = accounts[6];
    const voter6 = accounts[7];

    let VotingInstance;

    describe.only("Test of Openzeppelin for onlyOwner", function() {
        beforeEach(async function () {
            VotingInstance = await Voting.new({from:administrator});
        });

        it("should prompt the 'caller is not the owner'", async () => {
            await VotingInstance.addVoter(voter, {from: administrator});
            await expectRevert(VotingInstance.startProposalsRegistering({from: voter}), "caller is not the owner");
        });
    });

    describe.skip("test getvoter / addVoter / Registration", function () {
        //getVoter
        beforeEach(async function () {
            VotingInstance = await Voting.new({from:administrator});
        });

        it("should set Voter as registered", async () => {
            await VotingInstance.addVoter(voter, {from: administrator});
            const regVoter = await VotingInstance.getVoter(voter, {from: voter});
            expect(regVoter.isRegistered).is.true;
        });
        //Pour tester👇Nous avons besoin d'enregistrer un voter et vérifier si le nonVoter est inclus dans le tableau
        it("should not say that a nonVoter is registered", async () => {
            await VotingInstance.addVoter(voter, {from: administrator});
            const regNon = await VotingInstance.getVoter(nonvoter, {from: voter});
            expect(regNon.isRegistered).is.false;
        });
        //On vérifie si le voteur est bien initialisé à hasVoted == false;
        it("Registered Voter didn't already vote", async () => {
            await VotingInstance.addVoter(voter, {from: administrator});
            const whoVote = await VotingInstance.getVoter(voter, {from: voter});
            expect(whoVote.hasVoted).is.false;
        });
        //On vérifie que le voteur a un id de vote nul dès le début
        it("Registered Voter has voting proposal id equal to '0'", async () => {
            await VotingInstance.addVoter(voter, {from: administrator});
            const voteProp = await VotingInstance.getVoter(voter, {from: voter});
            expect(voteProp.votedProposalId).is.equal('0');
        });
        //Vérification de l'emit VoterRegistered
        it("should emit VoterRegistered for addVoter function", async () => {          
            const EventEmit = await VotingInstance.addVoter(voter, {from: administrator}); 
            expectEvent(EventEmit, "VoterRegistered", {voterAddress: voter});
        });

    });

    describe.skip("test getProposal / Proposals", function () {
        beforeEach(async function () {
            VotingInstance = await Voting.new({from:administrator});
        });
        //Test des getOneProposal pourr se faire, nous devons passer start Proposals Registering
        //On présume ici que les tests des fonctions appellées sont testé (ce que l'on fera par la suite).
        it("should store a proposal in proposalsArray", async () => {
            await VotingInstance.addVoter(voter, {from: administrator});
            await VotingInstance.startProposalsRegistering({from: administrator});
            const Propo = "This is a proposal.";
            await VotingInstance.addProposal(Propo, {from: voter});
            const proposal = await VotingInstance.getOneProposal(1, {from: voter});
            //☝️getOneProposal(1) car getOneProposal(0) == "Genesis"
            expect(proposal.description).to.equal(Propo);
        });
        //Expect a revert impossible de mettre une proposition pour un non voteur.
        it("cannot store a proposal from a nonVoter", async () => {
            await VotingInstance.addVoter(voter, {from: administrator});
            await VotingInstance.startProposalsRegistering({from: administrator});
            const Propo = "This is a proposal.";
            await expectRevert(VotingInstance.addProposal(Propo, {from: nonvoter}), "You're not a voter");
        });
        //Voir si on peut enregistrer une proposition vide
        it("cannot store as proposal an empty proposal", async () => {
            await VotingInstance.addVoter(voter, {from: administrator});
            await VotingInstance.startProposalsRegistering({from: administrator});
            const Propo = "";
            await expectRevert(VotingInstance.addProposal(Propo, {from: voter}), "Vous ne pouvez pas ne rien proposer");
        });
        it("handle 2 same entry and they are at the same place in the ProposalArray", async () => {
            await VotingInstance.addVoter(voter, {from: administrator});
            await VotingInstance.startProposalsRegistering({from: administrator});
            const Proposal1 = "This is my proposal";
            const Proposal2 = "This is my proposal";

            await VotingInstance.addProposal(Proposal1, {from: voter});
            await VotingInstance.addProposal(Proposal2, {from: voter});
            const proposal = await VotingInstance.getOneProposal(1, {from: voter});
            const proposal2 = await VotingInstance.getOneProposal(2, {from: voter});
            
            expect(proposal.description).to.equal(proposal2.description);
        });

        //Ne peut pas entrer de proposition si les proposals sont non autorisées
        it("cannot store a proposal if proposals are not allowed", async () => {
            await VotingInstance.addVoter(voter, {from: administrator});
            const Propo = "This is a proposal.";
            await expectRevert(VotingInstance.addProposal(Propo, {from: voter}), "Proposals are not allowed yet");
        });

        //Vérification de l'emit ProposalRegistered pour La première proposition
        it("should emit ProposalRegistered for addProposal function", async () => {       
            await VotingInstance.addVoter(voter, {from: administrator});  
            await VotingInstance.startProposalsRegistering({from: administrator}); 
            const Propo = "This is a proposal."; 
            const EventEmit = await VotingInstance.addProposal(Propo, {from: voter}); 
            expectEvent(EventEmit, "ProposalRegistered", {proposalId: new BN(1)});
        });

        //Vérification de l'emit ProposalRegistered pour une deuxième proposition
        it("should emit ProposalRegistered for addProposal function", async () => {       
            await VotingInstance.addVoter(voter, {from: administrator});  
            await VotingInstance.startProposalsRegistering({from: administrator}); 
            const Propo = "This is a proposal.";
            const Propo2 = "This is a proposal number 2."; 
            await VotingInstance.addProposal(Propo, {from: voter});
            const EventEmit = await VotingInstance.addProposal(Propo2, {from: voter}); 
            expectEvent(EventEmit, "ProposalRegistered", {proposalId: new BN(2)});
        });

        //Nous allons maintenant admettre pour toutes nouvelles propositions.
    });
    
    describe.skip("test du vote", function () {
        //Mes exemples se basent sur un deux propositions qui sont à l'id 1 & 2

        beforeEach(async function () {
            VotingInstance = await Voting.new({from:administrator});
            await VotingInstance.addVoter(voter, {from: administrator});
            await VotingInstance.startProposalsRegistering({from: administrator});
            const Proposal1 = "This is the first proposal";
            const Proposal2 = "This is the second proposal";
            await VotingInstance.addProposal(Proposal1, {from: voter});
            await VotingInstance.addProposal(Proposal2, {from: voter});
        });
        
        it("should not allow to vote if voting session is not started", async () => {
            await expectRevert(VotingInstance.setVote(1, {from: voter}), "Voting session havent started yet");
        });

        it("should not allow to vote if the proposal is at an index superior at the length of the proposalArray", async () => {
            await VotingInstance.endProposalsRegistering({from: administrator});
            await VotingInstance.startVotingSession({from: administrator});
            await expectRevert(VotingInstance.setVote(new BN(999), {from: voter}), "Proposal not found");
        });

        it("should add a voteCount to proposal voted by voter", async () =>{
            idProp = new BN(1);
            await VotingInstance.endProposalsRegistering({from: administrator});
            await VotingInstance.startVotingSession({from: administrator});            
            await VotingInstance.setVote(idProp, {from: voter});
            const proposal = await VotingInstance.getOneProposal(idProp, {from: voter});
            expect(proposal.voteCount).to.equal('1');
        });

        it("shouldn't accept the vote of a voter that already voted", async () =>{
            idProp = new BN(1);
            idProp2 = new BN(2);
            await VotingInstance.endProposalsRegistering({from: administrator});
            await VotingInstance.startVotingSession({from: administrator});            
            await VotingInstance.setVote(idProp, {from: voter});
            await expectRevert(VotingInstance.setVote(idProp2, {from: voter}), "You have already voted");
        });
        //Test de l'event vote
        it("should emit Voted with sender and id of Voted Proposal", async () => {
            idProp = new BN(1);
            await VotingInstance.endProposalsRegistering({from: administrator});
            await VotingInstance.startVotingSession({from: administrator});            
            const EventEmit = await VotingInstance.setVote(idProp, {from: voter}); 
            expectEvent(EventEmit, "Voted", {voter: voter, proposalId: idProp});
        });
    });

    describe.skip("test du tallyVotes", function () {

        beforeEach(async function () {
            VotingInstance = await Voting.new({from:administrator});
            await VotingInstance.addVoter(voter, {from: administrator});
            await VotingInstance.addVoter(voter2, {from: administrator});
            await VotingInstance.addVoter(voter3, {from: administrator});
            await VotingInstance.addVoter(voter4, {from: administrator});
            await VotingInstance.addVoter(voter5, {from: administrator});
            await VotingInstance.addVoter(voter6, {from: administrator});
            await VotingInstance.startProposalsRegistering({from: administrator});
            const Proposal1 = "This is the first proposal";
            const Proposal2 = "This is the second proposal";
            const Proposal3 = "This is the third proposal";
            idProp = new BN(1);
            idProp2 = new BN(2);
            idProp3 = new BN(3);
            await VotingInstance.addProposal(Proposal1, {from: voter});
            await VotingInstance.addProposal(Proposal2, {from: voter});
            await VotingInstance.addProposal(Proposal3, {from: voter});
            await VotingInstance.endProposalsRegistering({from: administrator});
            await VotingInstance.startVotingSession({from: administrator});
        });

        it("should not be possible to tally votes if status is not on endVotingSession", async () => {
            await expectRevert(VotingInstance.tallyVotes({from: administrator}), "Current status is not voting session ended");
        });

        it("should announce when the winner is the first proposal", async () => {
            await VotingInstance.setVote(idProp, {from: voter});
            await VotingInstance.setVote(idProp2, {from: voter2});
            await VotingInstance.setVote(idProp2, {from: voter3});
            await VotingInstance.setVote(idProp, {from: voter4});
            await VotingInstance.setVote(idProp, {from: voter5});
            await VotingInstance.setVote(idProp, {from: voter6});
            await VotingInstance.endVotingSession({from: administrator});
            await VotingInstance.tallyVotes({from: administrator});
            const winningId = await VotingInstance.winningProposalID();
            expect(winningId.words[0]).is.equal(1);
        });

        it("should announce when the winner is the third proposal", async () => {
            await VotingInstance.setVote(idProp3, {from: voter});
            await VotingInstance.setVote(idProp3, {from: voter2});
            await VotingInstance.setVote(idProp, {from: voter3});
            await VotingInstance.setVote(idProp, {from: voter4});
            await VotingInstance.setVote(idProp3, {from: voter5});
            await VotingInstance.setVote(idProp2, {from: voter6});
            await VotingInstance.endVotingSession({from: administrator});
            await VotingInstance.tallyVotes({from: administrator});
            const winningId = await VotingInstance.winningProposalID();
            expect(winningId.words[0]).is.equal(3);
        });

        it("should return the first result of the array when equality (in this example, the second proposal)", async () => {
            await VotingInstance.setVote(idProp, {from: voter});
            await VotingInstance.setVote(idProp2, {from: voter3});
            await VotingInstance.setVote(idProp3, {from: voter4});
            await VotingInstance.setVote(idProp2, {from: voter5});
            await VotingInstance.setVote(idProp3, {from: voter6});
            await VotingInstance.endVotingSession({from: administrator});
            await VotingInstance.tallyVotes({from: administrator});
            const winningId = await VotingInstance.winningProposalID();
            expect(winningId.words[0]).is.equal(2);
        });
    });

    describe.skip("Test of States and Events link to them", function() {
        beforeEach(async function () {
            VotingInstance = await Voting.new({from:administrator});
            await VotingInstance.addVoter(voter, {from: administrator});
        });

        it("should prompt the 'Registering proposals cant be started now'", async () => {
            await VotingInstance.startProposalsRegistering({from: administrator});
            await VotingInstance.endProposalsRegistering({from: administrator});
            await expectRevert(VotingInstance.startProposalsRegistering({from: administrator}), "Registering proposals cant be started now");
        });

        it("should emit workflowStatusChange as ProposalsRegistrationStarted", async () => {
            const EventEmit = await VotingInstance.startProposalsRegistering({from: administrator});      
            expectEvent(EventEmit, "WorkflowStatusChange", {previousStatus: Voting.WorkflowStatus.RegisteringVoters.toString(), newStatus: Voting.WorkflowStatus.ProposalsRegistrationStarted.toString()});
        });

        it("should prompt the 'Registering proposals havent started yet'", async () => {
            await expectRevert(VotingInstance.endProposalsRegistering({from: administrator}), "Registering proposals havent started yet");
        });

        it("should emit workflowStatusChange for ProposalsRegistrationEnded", async () => {
            await VotingInstance.startProposalsRegistering({from: administrator}); 
            const EventEmit = await VotingInstance.endProposalsRegistering({from: administrator});    
            expectEvent(EventEmit, "WorkflowStatusChange", {previousStatus: Voting.WorkflowStatus.ProposalsRegistrationStarted.toString(), newStatus: Voting.WorkflowStatus.ProposalsRegistrationEnded.toString()});
        });

        it("should prompt the 'Registering proposals phase is not finished'", async () => {
            await expectRevert(VotingInstance.startVotingSession({from: administrator}), "Registering proposals phase is not finished");
        });

        it("should emit workflowStatusChange as VotingSessionStarted", async () => {
            await VotingInstance.startProposalsRegistering({from: administrator}); 
            await VotingInstance.endProposalsRegistering({from: administrator});
            const EventEmit = await VotingInstance.startVotingSession({from: administrator});    
            expectEvent(EventEmit, "WorkflowStatusChange", {previousStatus: Voting.WorkflowStatus.ProposalsRegistrationEnded.toString(), newStatus: Voting.WorkflowStatus.VotingSessionStarted.toString()});
        });

        it("should prompt the 'Voting session havent started yet'", async () => {
            await expectRevert(VotingInstance.endVotingSession({from: administrator}), "Voting session havent started yet");
        });

        it("should emit workflowStatusChange for VotingSessionEnded", async () => {
            await VotingInstance.startProposalsRegistering({from: administrator}); 
            await VotingInstance.endProposalsRegistering({from: administrator});
            await VotingInstance.startVotingSession({from: administrator});
            const EventEmit = await VotingInstance.endVotingSession({from: administrator});    
            expectEvent(EventEmit, "WorkflowStatusChange", {previousStatus: Voting.WorkflowStatus.VotingSessionStarted.toString(), newStatus: Voting.WorkflowStatus.VotingSessionEnded.toString()});
        });

        it("should prompt the 'Current status is not voting session ended'", async () => {
            await expectRevert(VotingInstance.tallyVotes({from: administrator}), "Current status is not voting session ended");
        });

        it("should emit workflowStatusChange for VotingSessionEnded", async () => {
            await VotingInstance.startProposalsRegistering({from: administrator}); 
            await VotingInstance.endProposalsRegistering({from: administrator});
            await VotingInstance.startVotingSession({from: administrator});
            await VotingInstance.endVotingSession({from: administrator});
            const EventEmit = await VotingInstance.tallyVotes({from: administrator});    
            expectEvent(EventEmit, "WorkflowStatusChange", {previousStatus: Voting.WorkflowStatus.VotingSessionEnded.toString(), newStatus: Voting.WorkflowStatus.VotesTallied.toString()});
        });

    });

});