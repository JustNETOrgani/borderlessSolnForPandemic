// SPDX-License-Identifier: MIT
pragma solidity 0.5.7;
// // !!!!!!  Only used for Vulnerability testing not deployment!!!!!.
// Contract begins. 
contract CountrySC{
    // Structs to be used in the contract.
    struct PatientStruct{
        bytes32 PHID; // Hashed Identifier of user.
        bytes32 hIPFShash; // Hash of the IPFS hash. // Delinks on-chain connection to IPFS.
        bytes32 proofOfCovidStatus; // Contains Merkle root hash.
    }
    struct TCs{
        string TC_name; // Name of Testing Center
        address TC_addr; // Address of TC.
        StateOfTC tcState; // State of the Patient.
    }
    enum StateOfTC {Holding, Activated, Revoked} // States that TCs can be.
    // Global state variables.
    address public hmDir; // Contract deployer like Health Ministry or CDC in a country.
    // Public mappings.
    mapping (bytes32 => PatientStruct) internal patient; //Mapping for patients.
    mapping (address => TCs)  public tC; // Mapping for approved health facilities.
    
    // Public states.
    StateOfTC public stateOfTheTC;
    uint256 totalTested;
    uint256 totalRecordUpdate;
    
    // Events begin.
    event SCdeployment(string deployMsg);
    event PatientRegistered(address indexed txInitiator);
    event PatientRecordUpdated(address indexed txInitiator);
    event TCregistered(string nameOfTC, address addOfTC);
    event TCRevoked(address indexed TCaddr, string reason);
    event TCreActivated(address indexed TCaddr, string reason);
    
    // Constructor for the contract.
    constructor() public {
        hmDir = msg.sender;
        stateOfTheTC = StateOfTC.Holding;
        totalTested = 0;
        totalRecordUpdate = 0;
        emit SCdeployment("Country SC deployed");
    }
    //Creating an access modifier for contractDeployer=>Country.
    modifier hM {
     require(msg.sender == hmDir);
     _;
     }
     
     //Creating an access modifier for TCs only.
    modifier tCsOnly {
     require(tC[msg.sender].TC_addr != address(0), "TC unknown");
     _;
     }
    
    // Function to authenticate TC login via MetaMask.
    function checkTCLogin() external view returns (bool) {
        if (tC[msg.sender].TC_addr != address(0)) {
            // TC is registered.
            return true;
        }
        else {
            // Unregistered TC.
            return false;
        }
    }
     
    // Function to register a TC.
    function registerTC(string calldata tCName,address tCAddr) hM external returns (bool){
        tC[tCAddr].TC_addr = tCAddr;
        tC[tCAddr].TC_name = tCName;
        tC[tCAddr].tcState = StateOfTC.Activated;
        emit TCregistered(tCName, tCAddr); // Emit event on creation of a TC. 
        return true;
    }
    
    // Function to revoke a TC's status.
    function revokeTCcert(string calldata tCName,address tCAddr, string calldata reason) hM external returns (bool){
		require (tC[tCAddr].TC_addr == tCAddr, "Address of TC mismatch");
		require (keccak256(abi.encodePacked(tC[tCAddr].TC_name)) == keccak256(abi.encodePacked(tCName)), "Name of TC mismatch");
        tC[tCAddr].tcState = StateOfTC.Revoked;
        emit TCRevoked(tCAddr, reason); // Emit event on revoke of country. 
        return true;
    }
    
    // Function to re-activate a country's status.
    function reactivateTCcert(string calldata tCName,address tCAddr, string calldata reason) hM external returns (bool){
		require (tC[tCAddr].TC_addr == tCAddr, "Address of TC mismatch");
		require (keccak256(abi.encodePacked(tC[tCAddr].TC_name)) == keccak256(abi.encodePacked(tCName)), "Name of TC mismatch");
        tC[tCAddr].tcState = StateOfTC.Activated;
        emit TCreActivated(tCAddr, reason); // Emit event on revoke of country. 
        return true;
    }
    
    // Function to get TC details. Only registered TCs can call due to msg.sender usage.
    function getTCInfo() tCsOnly external view returns (address, string memory, StateOfTC) {
        return (hmDir, tC[msg.sender].TC_name, tC[msg.sender].tcState);
    }
    
    // Function to register patient.
    function patientRegistration(bytes32 pHID, bytes32 hIPFShash, bytes32 proofOfCovidStatus) tCsOnly external returns (bool result){
        // AA checks.
        require (tC[msg.sender].tcState==StateOfTC.Activated, 'Access denied');// Check msg.sender is part of Activated TCs.
        require (patient[pHID].PHID == "", "PHID already exist");
        patient[pHID] = PatientStruct(pHID, hIPFShash, proofOfCovidStatus);
        totalTested += 1;
        emit PatientRegistered(msg.sender);
        return true;
    }
    //  Fucntion to update a person's Covid-19 test status by an approvedHealthFacility.
    function patientRecordUpdate(bytes32 pHID, bytes32 hIPFShash, bytes32 proofOfCovidStatus) tCsOnly external returns (bool result){
        // AA checks.
        require (tC[msg.sender].tcState==StateOfTC.Activated, 'Access denied');// Check msg.sender is part of Activated TCs.
        require(patient[pHID].PHID == pHID, 'Invalid Hashed Identifier');
        // Update person records
        patient[pHID].hIPFShash = hIPFShash;
        patient[pHID].proofOfCovidStatus = proofOfCovidStatus;
        totalRecordUpdate +=1;
        emit PatientRecordUpdated(msg.sender);
        return true;
    }
    // Function for status verification.
    function verifyUserStatus(bytes32 hIPFShash, bytes32 pHID, bytes32 proofOfCovidStatus) external view returns (bool) {
        PatientStruct memory ps = patient[pHID];
        if (ps.hIPFShash==hIPFShash && ps.proofOfCovidStatus== proofOfCovidStatus) {
            return true;
        }
        else {
            return false;
        }
    }
    // Function to get public info.
    function getPublicStatistics() external view returns (uint256 Total_tested, uint256 UpdatedRecords) {
        return (totalTested, totalRecordUpdate);
    }
}