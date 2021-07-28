// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
// SC to be deployed by each country.
// Contract begins. 
contract countrySC{
    // Structs to be used in the contract.
    struct patientStruct{
        address patientAddress; // Blockchain address of person.
        bytes32 PHID; // Hashed Identifier of user.
        bytes32 hIPFShash; // Hash of the IPFS hash. // Delinks on-chain connection to IPFS.
        bytes32 proofOfCovidStatus; // Contains Merkle root hash.
        string signature; // Signature generated from the IPFShash as message.
    }
    struct TCs{
        string TC_name; // Name of Testing Center
        address TC_addr; // Address of TC.
        stateOfTC tcState; // State of the Patient.
    }
    enum stateOfTC {Holding, Activated, Revoked} // States that TCs can be.
    // Global state variables.
    address HMdir; // Contract deployer like Health Ministry or CDC in a country.
    // Public mappings.
    mapping (bytes32 => patientStruct) internal patient; //Mapping for patients.
    mapping (address => TCs)  public TC; // Mapping for approved health facilities.
    
    // Public states.
    stateOfTC public stateOfTheTC;
    uint256 totalTested;
    uint256 totalRecordUpdate;
    uint256 totalVaccinated;
    
    // Events begin.
    event patientRegistered(address indexed txInitiator);
    event patientRecordUpdated(address indexed txInitiator);
    event TCregistered(string nameOfTC, address addOfTC);
    event TCRevoked(address indexed TCaddr, string reason);
    event TCreActivated(address indexed TCaddr, string reason);
    
    // Constructor for the contract.
    constructor() {
        HMdir = msg.sender;
        stateOfTheTC = stateOfTC.Holding;
        totalTested = 0;
        totalRecordUpdate = 0;
        totalVaccinated = 0;
    }
    //Creating an access modifier for contractDeployer=>Country.
    modifier HM {
     require(msg.sender == HMdir);
     _;
     }
     
     //Creating an access modifier for TCs only.
    modifier TCsOnly {
     require(TC[msg.sender].TC_addr != address(0), "TC unknown");
     _;
     }
    
    // Function to authenticate TC login via MetaMask.
    function checkTCLogin() public view returns (bool) {
        if (TC[msg.sender].TC_addr != address(0)) {
            // TC is registered.
            return true;
        }
        else {
            // Unregistered TC.
            return false;
        }
    }
     
    // Function to register a TC.
    function registerTC(string memory _TC_name,address _TC_addr) HM public returns (bool){
        TC[_TC_addr].TC_addr = _TC_addr;
        TC[_TC_addr].TC_name = _TC_name;
        TC[_TC_addr].tcState = stateOfTC.Activated;
        emit TCregistered(_TC_name, _TC_addr); // Emit event on creation of a TC. 
        return true;
    }
    
    // Function to revoke a TC's status.
    function revokeTCcert(string memory _TC_name,address _TC_addr, string memory reason) HM public returns (bool){
		require (TC[_TC_addr].TC_addr == _TC_addr, "Address of TC mismatch");
		require (keccak256(abi.encodePacked(TC[_TC_addr].TC_name)) == keccak256(abi.encodePacked(_TC_name)), "Name of TC mismatch");
        TC[_TC_addr].tcState = stateOfTC.Revoked;
        emit TCRevoked(_TC_addr, reason); // Emit event on revoke of country. 
        return true;
    }
    
    // Function to re-activate a country's status.
    function reactivateTCcert(string memory _TC_name,address _TC_addr, string memory reason) HM public returns (bool){
		require (TC[_TC_addr].TC_addr == _TC_addr, "Address of TC mismatch");
		require (keccak256(abi.encodePacked(TC[_TC_addr].TC_name)) == keccak256(abi.encodePacked(_TC_name)), "Name of TC mismatch");
        TC[_TC_addr].tcState = stateOfTC.Activated;
        emit TCreActivated(_TC_addr, reason); // Emit event on revoke of country. 
        return true;
    }
    
    // Function to get TC details. Only registered TCs can call due to msg.sender usage.
    function getTCInfo() TCsOnly public view returns (string memory, stateOfTC) {
        return (TC[msg.sender].TC_name, TC[msg.sender].tcState);
    }
    
    // Function to register patient.
    function patientRegistration(address _patientAddress, bytes32 _PHID, bytes32 _hIPFShash, bytes32 _proofOfCovidStatus, uint8 _vState, string memory _signature) TCsOnly public returns (bool result){
        // AA checks.
        require (TC[msg.sender].tcState==stateOfTC.Activated, 'Access denied');// Check msg.sender is part of Activated TCs.
        require (patient[_PHID].PHID == "", "PHID already exist");
        patient[_PHID] = patientStruct(_patientAddress, _PHID, _hIPFShash, _proofOfCovidStatus, _signature);
        totalTested += 1;
        if (_vState == 1) {
            totalVaccinated += 1;
        }
        emit patientRegistered(msg.sender);
        return true;
    }
    //  Fucntion to update a person's Covid-19 test status by an approvedHealthFacility.
    function patientRecordUpdate(address _patientAddress, bytes32 _PHID, bytes32 _hIPFShash, bytes32 _proofOfCovidStatus, uint8 _vState, string memory _signature_new) TCsOnly public returns (bool result){
        // AA checks.
        require (TC[msg.sender].tcState==stateOfTC.Activated, 'Access denied');// Check msg.sender is part of Activated TCs.
        require(patient[_PHID].PHID == _PHID, 'Invalid Hashed Identifier');
        require (patient[_PHID].patientAddress == _patientAddress, "Address mismatch");
        // Update person records
        patient[_PHID].hIPFShash = _hIPFShash;
        patient[_PHID].proofOfCovidStatus = _proofOfCovidStatus;
        patient[_PHID].signature = _signature_new;
        if (_vState == 1) {
            totalVaccinated += 1;
        }
        totalRecordUpdate +=1;
        emit patientRecordUpdated(msg.sender);
        return true;
    }
    // Function for status verification.
    function verifyUserStatus(bytes32 hIPFShash, bytes32 _PHID, bytes32 _proofOfCovidStatus, string memory signature) public view returns (bool) {
        patientStruct memory ps = patient[_PHID];
        if (ps.hIPFShash==hIPFShash && ps.proofOfCovidStatus==_proofOfCovidStatus) {
            bytes memory sigBytes = bytes(signature);
            if (sigBytes.length == 0) {
                // Person is verifying without Signature
                return true;
            }
            else {
                    // Person is verifying via Signature
                    // Check signature matches on-chain signature to confirm ownership of the address.
                    if (keccak256(abi.encodePacked(patient[_PHID].signature)) == keccak256(abi.encodePacked(signature))){
                        return true;
                    }
                    else {
                        return false;
                    }
            }
        }
        else {
            return false;
        }
    }
    
    //  Fucntion to update a Patient's blockchain address per Patient.
    function updateBlockchainAddr(bytes32 _PHID, address personNewAddr) public returns (bool result){
        require (patient[_PHID].patientAddress == msg.sender, "Unauthorized Patient"); // Current address required before change is initiated.
        // Update person address.
        patient[_PHID].patientAddress = personNewAddr;
        return true;
    }
}