// SPDX-License-Identifier: MIT
pragma solidity 0.5.7;
// !!!!!!  Only used for Vulnerability testing not deployment!!!!!.
// Contract begins. 
contract WHOsc {
    // Structs to be used in the contract.
    struct RegisteredCountry{
        string nameOfCountry; // Name of the Country.
        string bcType; // Blockchain type in use by the country.
        address addrOfCountry; // Blockchain address of the Country.
        address addrOfSC; // Address of SC deployed by Country.
        string tcIPFShash; // IPFS hash of Country's TCs.
		StateOfCountry cState; // State of the country.
    }
	
	enum StateOfCountry {Holding, Activated, Revoked} // States that countries can be. 
 
    address public wHOdir; // Contract deployer = WHO.
    uint256 public numOfCountriesRegistered; // Total registered countries.
    
    // Mappings.
    mapping (address => RegisteredCountry)  public country; // Mapping for registered countries.
	
	// Public states.
    StateOfCountry public stateOfTheCountry;
	
    // Events begin.
    event WHOscDeployment(string deployMsg);
    event CountryRegistered(address countryAddr, string countryName);
    event CountryTCsUpdated(address countryAddr);
    event CountryRevoked(address indexed countryAddr, string reason);
    event CountryReActivated(address indexed countryAddr, string reason);
    
    // Constructor for the contract.
    constructor() public {
        wHOdir = msg.sender;
		stateOfTheCountry = StateOfCountry.Holding;
		numOfCountriesRegistered = 0;
		emit WHOscDeployment("WHO SC deployed");
    }
    
    // Creating an access modifier for contractDeployer
    modifier wHO {
     require(msg.sender == wHOdir);
     _;
     }
    
    // Access modifier for Country only.
    modifier registeredCountryOnly {
     require(country[msg.sender].addrOfCountry != address(0), "Unregistered country"); // A registered country cannot access another country's data.
     _;
     }
     
    // Function to authenticate WHO login via MetaMask.
    function checkWHOaddr() external view returns (bool) {
        if (msg.sender == wHOdir) {
            return true;
        }
        else {
            return false;
        }
    }

    // Function to register a country.
    function registerCountry(string calldata  bcType, string calldata  nameOfCountry,address addrOfCountry, address addrOfSC, string calldata  tcIPFShash) wHO external returns (bool){
        country[addrOfCountry] = RegisteredCountry(nameOfCountry, bcType, addrOfCountry, addrOfSC, tcIPFShash, StateOfCountry.Activated);
        numOfCountriesRegistered +=1;
        emit CountryRegistered(addrOfCountry, nameOfCountry); // Emit event on registeration of a country. 
        return true;
    }
  
    // Function to revoke a country's status.
    function revokeCountry(string calldata  nameOfCountry,address addrOfCountry, string calldata  reason) wHO external returns (bool){
		require (country[addrOfCountry].addrOfCountry == addrOfCountry, "Address of country mismatch");
		require (keccak256(abi.encodePacked(country[addrOfCountry].nameOfCountry)) == keccak256(abi.encodePacked(nameOfCountry)), "Name of country mismatch");
        country[addrOfCountry].cState = StateOfCountry.Revoked;
        emit CountryRevoked(addrOfCountry, reason); // Emit event on revoke of country. 
        return true;
    }
    
    // Function to re-activate a country's status.
    function reactivateCountry(string calldata  nameOfCountry,address addrOfCountry, string calldata  reason) wHO external returns (bool){
		require (country[addrOfCountry].addrOfCountry == addrOfCountry, "Address of country mismatch");
		require (keccak256(abi.encodePacked(country[addrOfCountry].nameOfCountry)) == keccak256(abi.encodePacked(nameOfCountry)), "Name of country mismatch");
        country[addrOfCountry].cState = StateOfCountry.Activated;
        emit CountryReActivated(addrOfCountry, reason); // Emit event on revoke of country. 
        return true;
    }
    
     // Function for country verification at Patient verification time.
    function verificationTime(address addrOfCountry) external view returns (string memory) {
        require (country[addrOfCountry].cState == StateOfCountry.Activated, "Country either not listed or revoked");
        return country[addrOfCountry].tcIPFShash;
    }
    
    // Function to get total number of countries registered.
    function totalRegisteredCountries() external view returns (uint256) {
        return numOfCountriesRegistered;
    }
    
    // Functions that registered countries can interact with.
    // Function to authenticate WHO login via MetaMask.
    function checkLoginAddr() external view returns (bool) {
        if (country[msg.sender].addrOfCountry != address(0)) {
            return true;
        }
        else {
            return false;
        }
    }
        
    // Function to update IPFS hash containing country's TCs.
    function updateTChash(string calldata  newTcIPFShash) registeredCountryOnly external returns (bool result){
        require (keccak256(abi.encodePacked(country[msg.sender].tcIPFShash)) != keccak256(abi.encodePacked(newTcIPFShash)), "IPFS hash already exist");
        country[msg.sender].tcIPFShash = newTcIPFShash;
        emit CountryTCsUpdated(msg.sender);
        return true;
    }
    
    // Function to get country details. Only registered countries can call due to msg.sender usage.
    function getCountryInfo() registeredCountryOnly external view returns (string memory, string memory, StateOfCountry) {
        return (country[msg.sender].nameOfCountry, country[msg.sender].tcIPFShash, country[msg.sender].cState);
    }
}