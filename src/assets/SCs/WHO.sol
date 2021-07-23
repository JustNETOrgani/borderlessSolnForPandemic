// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
// A Smart Contract to to be deployed by WHO.
// Contract begins. 
contract WHOsc {
    // Structs to be used in the contract.
    struct registeredCountry{
        string nameOfCountry; // Name of the Country.
        string bcType; // Blockchain type in use by the country.
        address addrOfSC; // Blockchain address of SC deployed by Country.
        bytes32 IPFShash; // IPFS hash of Country's TCs.
		stateOfCountry cState; // State of the country.
    }
	
	enum stateOfCountry {Holding, Activated, ReActivated, Revoked} // States that countries can be. 
 
    address WHOdir; // Contract deployer = WHO.
    // Mappings.
    mapping (address => registeredCountry)  public country; // Mapping for registered countries.
	
	// Public states.
    stateOfCountry public stateOfTheCountry;
	
    // Events begin.
    event countryRegistered(address indexed countryAddr, string countryName);
    event countryTCsUpdated(address indexed countryAddr);
    event countryRevoked(address indexed countryAddr, string reason);
    event countryReActivated(address indexed countryAddr, string reason);
    
    // Constructor for the contract.
    constructor() {
        WHOdir = msg.sender;
		stateOfTheCountry = stateOfCountry.Holding;
    }
    //Creating an access modifier for contractDeployer
    modifier WHO {
     require(msg.sender == WHOdir);
     _;
     }

    // Function to register a country.
    function registerCountry(string memory _bcType, string memory _nameOfCountry,address _addrOfCountry, bytes32 _IPFShash) WHO public returns (bool){
        country[_addrOfCountry] = registeredCountry(_nameOfCountry, _bcType, _addrOfCountry, _IPFShash, stateOfCountry.Activated);
        emit countryRegistered(_addrOfCountry, _nameOfCountry); // Emit event on registeration of a country. 
        return true;
    }
    // Function to update IPFS hash containing country's TCs.
    function updateCountryTCs(string memory _nameOfCountry,address _addrOfCountry, bytes32 _newIPFShash) WHO public returns (bool result){
        // AA checks
        require (country[_addrOfCountry].addrOfSC == _addrOfCountry, "Address of country mismatch");
        require (keccak256(abi.encodePacked(country[_addrOfCountry].nameOfCountry)) == keccak256(abi.encodePacked(_nameOfCountry)), "Name of country mismatch");
        country[_addrOfCountry].IPFShash = _newIPFShash;
        emit countryTCsUpdated(_addrOfCountry);
        return true;
    }
  
    // Function to revoke a country's status.
    function revokeCountry(string memory _nameOfCountry,address _addrOfCountry, string memory reason) WHO public returns (bool){
		require (country[_addrOfCountry].addrOfSC == _addrOfCountry, "Address of country mismatch");
		require (keccak256(abi.encodePacked(country[_addrOfCountry].nameOfCountry)) == keccak256(abi.encodePacked(_nameOfCountry)), "Name of country mismatch");
        country[_addrOfCountry].cState = stateOfCountry.Revoked;
        emit countryRevoked(_addrOfCountry, reason); // Emit event on revoke of country. 
        return true;
    }
    
    // Function to re-activate a country's status.
    function reactivateCountry(string memory _nameOfCountry,address _addrOfCountry, string memory reason) WHO public returns (bool){
		require (country[_addrOfCountry].addrOfSC == _addrOfCountry, "Address of country mismatch");
		require (keccak256(abi.encodePacked(country[_addrOfCountry].nameOfCountry)) == keccak256(abi.encodePacked(_nameOfCountry)), "Name of country mismatch");
        country[_addrOfCountry].cState = stateOfCountry.ReActivated;
        emit countryReActivated(_addrOfCountry, reason); // Emit event on revoke of country. 
        return true;
    }
    
     // Function for country verification at Patient verification time.
    function getCountryIPFShasForTCs(address _addrOfCountry) public view returns (bytes32) {
        return country[_addrOfCountry].IPFShash;
    }
}