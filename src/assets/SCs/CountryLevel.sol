// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
// SC to be deployed by each country.
// Contract begins. 
contract countrySC{
    // Structs to be used in the contract.
    struct patientStruct{
        address personAddress; // Blockchain address of person.
        bytes32 HID; // Hashed Identifier of user.
        bytes32 hIPFShash; // Hash of the IPFS hash. // Delinks on-chain connection to IPFS.
        bytes32 covidTnVStatus; // Contains Merkle root hash.
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
    event patientRegistered(address indexed txInitiator, bytes32 HID);
    event patientRecordUpdated(address indexed txInitiator,bytes32 HID);
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
    //Creating an access modifier for contractDeployer
    modifier HM {
     require(msg.sender == HMdir);
     _;
     }
     
    // Function to authenticate Country login via MetaMask.
    function checkLoginAddr() public view returns (bool) {
        if (msg.sender == HMdir) {
            return true;
        }
        else {
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
    
    // Function to register patient.
    function patientRegistration(address _personAddress, bytes32 _HID, bytes32 _hIPFShash, bytes32 _covidTnVStatus, uint8 _vState, string memory _signature) public returns (bool result){
        // AA checks.
        require (TC[msg.sender].tcState==stateOfTC.Activated, 'Access denied');// Check msg.sender is part of Activated TCs.
        require (patient[_HID].HID == "", "HID already exist");
        patient[_HID] = patientStruct(_personAddress, _HID, _hIPFShash, _covidTnVStatus, _signature);
        totalTested += 1;
        if (_vState == 1) {
            totalVaccinated += 1;
        }
        emit patientRegistered(msg.sender, _HID);
        return true;
    }
    //  Fucntion to update a person's Covid-19 test status by an approvedHealthFacility.
    function patientRecordUpdate(address _personAddress, bytes32 _HID, bytes32 _hIPFShash, bytes32 _covidTnVStatus, uint8 _vState, string memory _signature_new) public returns (bool result){
        // AA checks.
        require (TC[msg.sender].tcState==stateOfTC.Activated, 'Access denied');// Check msg.sender is part of Activated TCs.
        require(patient[_HID].HID == _HID, 'Invalid Hashed Identifier');
        require (patient[_HID].personAddress == _personAddress, "Address mismatch");
        // Update person records
        patient[_HID].hIPFShash = _hIPFShash;
        patient[_HID].covidTnVStatus = _covidTnVStatus;
        patient[_HID].signature = _signature_new;
        if (_vState == 1) {
            totalVaccinated += 1;
        }
        totalRecordUpdate +=1;
        emit patientRecordUpdated(msg.sender, _HID);
        return true;
    }
    // Function for status verification.
    function verifyUserStatus(bytes32 hIPFShash, bytes32 HID, bytes32 covidTnVStatus, string memory signature) public view returns (bool) {
        patientStruct memory ps = patient[HID];
        if (ps.hIPFShash==hIPFShash && ps.covidTnVStatus==covidTnVStatus) {
            bytes memory sigBytes = bytes(signature);
            if (sigBytes.length == 0) {
                // Person is verifying without Signature
                return true;
            }
            else {
                    // Person is verifying via Signature
                    // Check signature matches on-chain signature to confirm ownership of the address.
                    if (keccak256(abi.encodePacked(patient[HID].signature)) == keccak256(abi.encodePacked(signature))){
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
    
    //  Fucntion to update a person's blockchain address.
    function updateBlockchainAddr(address personNewAddr, bytes32 HID, bytes32 currenthIPFShash, string memory signatureOnIPFShash) public returns (bool result){
        require (patient[HID].HID == HID, 'Invalid Hashed Identifier');
        require (patient[HID].hIPFShash == currenthIPFShash, 'Hashed IPFS mismatch');
        require (keccak256(abi.encodePacked(patient[HID].signature)) == keccak256(abi.encodePacked(signatureOnIPFShash)), 'Signature mismatch'); // Signature generated using existing signature before new address can be updated.
        // Update person address.
        patient[HID].personAddress = personNewAddr;
        return true;
    }
}