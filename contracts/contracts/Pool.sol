//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.1;

import "@openzeppelin/contracts/utils/Counters.sol";

import "./PoolTicket.sol";

// We do not need to use safemath since solidity 0.8 have overflow checks by default
//import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract Pool is PoolTicket {
  using Counters for Counters.Counter;

  uint16  private constant maxWinningPercentages = 20;
  uint8   private constant dao_address_index = 0;

  uint256 private ticketPurchaseCurrentZeroIndex = 0;
  uint256 private startTokenId;

  // Configurations for the next draw (5 minutes set for testing)
  uint64  private participantsForRound;
  uint8[] private winningPercentages;

  uint64  private nextParticipantsForRound;
  uint8[] private nextWinningPercentages;

  uint256 currentParticipantCount = 0;

  // We set a variable for lottery processing because
  // block.timestmap's accuracy cannot be relied upon
  // And we dont want a user to purchase a ticket during
  // the processing going on

  Counters.Counter private drawNumberTracker;

  address daoAddress;

  mapping (uint256 => bool) public _winningTokens;

  event LotteryDraw(uint256 indexed drawNumber, uint256 drawTotal, uint256 drawTimestamp);

  constructor() {    
    winningPercentages.push(60);
    winningPercentages.push(40);
    // winningPercentages.push(20);
    // winningPercentages.push(15);
    nextWinningPercentages = winningPercentages;

    uint64 _participantsForRound = 2;
    participantsForRound = _participantsForRound;
    nextParticipantsForRound = _participantsForRound;

    // We dont want draw 0 to exist
    drawNumberTracker.increment();

    startTokenId = _getLastTicketPurchased() + 1;

    // temporarily for testing
    daoAddress = address(this);
  } 

  function getDetails(address userAddress) external view returns (
      uint256 amount, 
      uint256 currentDrawNumber,
      uint256 ticketPrice,
      uint256 currentParticipants,
      uint256 maxParticipants,
      bool enteredCurrentDraw
    ) {
    uint256 accountBalance = (address(this)).balance;
    uint256 _amount = accountBalance - _getLockedContractPoolAmount();
    uint256 _currentDrawNumber = drawNumberTracker.current();
    uint256 _ticketPrice = _getTicketPrice();
    uint256 _participantCount = currentParticipantCount;
    uint256 _maxParticipants = participantsForRound;
    bool _enteredCurrentDraw = _hasAddressPurchasedForDraw(_currentDrawNumber, userAddress);

    return (
      _amount,
      _currentDrawNumber,
      _ticketPrice,
      _participantCount,
      _maxParticipants,
      _enteredCurrentDraw
    );
  }
    
  /**
   * Callback function used by VRF Coordinator
   */
  function processDraw() private {
    // Get the correct contractPoolTotal by subtracting
    // the locked amount
    uint256 accountBalance = address(this).balance;
    uint256 contractPoolTotal = accountBalance - _getLockedContractPoolAmount();

    uint256 lastTicketIdPurchased = _getLastTicketPurchased();

    // Since tokens are numerical, we use the tokenIds to calculate the winners
    uint256 participantsCount = currentParticipantCount;
    uint256 remainingContractPool = contractPoolTotal;
    
    // In cases there are less participants than there are winning distributions
    // (In these cases, we allow the winner to get the enire remaining distribution)
    // However this can easily be changed, for example to carry over to the next draw
    uint256 iterationLength = (participantsCount > winningPercentages.length)
      ? winningPercentages.length
      : participantsCount;

    // We reverse iterate because we want to add any remaining values to the winner
    for (uint256 _i = iterationLength; _i > 0; _i--) {
      uint256 index = _i - 1; // In order to not trigger underflow validations we do not do arrLength - 1
      uint256 winningPercentage = winningPercentages[index];

      uint256 rand = uint256(generateRand());

      uint256 winningAmount = calculatePercentage(contractPoolTotal, winningPercentage);
      remainingContractPool -= winningAmount;

      allocateWinningsBasedOnIndex(index, winningAmount, remainingContractPool, lastTicketIdPurchased, rand, participantsCount);
    }

    completeLottery(contractPoolTotal);
  }

  function allocateWinningsBasedOnIndex(uint256 index,
                                        uint256 winningAmount,
                                        uint256 remainingContractPool,
                                        uint256 lastTicketIdPurchased,
                                        uint256 rand,
                                        uint256 participantsCount) private {
      // We add any remaining amounts that would have been left
      if(index == dao_address_index) {
        winningAmount += remainingContractPool;
        // TODO : transfer to dao address?
        allocateWinnings(0, winningAmount);
        return;
      }
      uint256 winningToken = getWinningToken(lastTicketIdPurchased, rand, participantsCount);
      _winningTokens[winningToken] = true;
      allocateWinnings(winningToken, winningAmount);
  }

  function getWinningToken(uint256 lastTokenId, uint256 rand, uint256 participantsCount) private view returns (uint256) {
      uint256 winningToken = 1;
      uint16 incrementer = 0;
      uint256 winningBase = (startTokenId + (rand % (participantsCount + 1)));

      /**
        While this itself looks like it could cause an infinite loop we only allow 20 winning percentages max.
        Whih means within traversing 20 times max (worst case), we will always find a unique number.

        This is ON TOP of the fact that a collission itself would keep getting rarer as the participant list grows.
        Since colissions are rare, we opt against constantly generating a pseudo random number to add onto the true random number
        And instead opt to go to the next token.

        (Note that the Map acesses are O(1) so it wont have a huge cost, except for storage. Where there would be maximum, 20 more
        entries per draw, if we assume a week. that would be (20 * 53) new entries per year)
        */
      do {
        winningToken = winningBase + incrementer;
        incrementer++;

        // When the last tokenId has been surpassed
        if((incrementer + winningToken) > lastTokenId) {
          winningBase = startTokenId;
          incrementer = 0;
        }
      } while(_winningTokens[winningToken] || winningToken > lastTokenId);

      return winningToken;
  }

  function completeLottery(uint256 contractPoolTotal) private {
    emit LotteryDraw(drawNumberTracker.current(), contractPoolTotal, block.timestamp);

    drawNumberTracker.increment();
    
    currentParticipantCount = 0;
    participantsForRound = nextParticipantsForRound;
    winningPercentages = nextWinningPercentages;

    _refreshTicketPriceForNextDraw();
  }

  /**
    Calculate the balance based on the percentage
    (Note that solidity will omit the floating point amount)
  */
  function calculatePercentage(uint amount, uint percentage) private pure returns (uint256){
      return amount * percentage / 100;
  }

  function buyTicket(uint256 drawNumber) external payable {
    uint256 currentDrawNumber = drawNumberTracker.current();
    require(drawNumber == currentDrawNumber, "The draw number passed was invalid");

    // Which triggers the "startDraw" function after the purchase is done. If another user buys
    require(participantsForRound > currentParticipantCount, "The required participants for this round has been met");
    
    /**
      Each time a draw is reset we reset firstPurchaseDone to false
      So when the first purchase OF THE NEXT Draw happens we capture
      the next token Id
     */
    if(currentParticipantCount == 0) {
      // We set this before the ACTUAL purchase/increase
      // which is _buyTicket so add 1 to get the future id
      startTokenId = _getLastTicketPurchased() + 1; 
    }
    _buyTicket(drawNumber);
    currentParticipantCount++;

    if (currentParticipantCount == participantsForRound) {
      processDraw();
    }
  }

  function generateRand() private view returns (bytes32 result) {
		bytes32 input;
		assembly {
			let memPtr := mload(0x40)
					if iszero(staticcall(not(0), 0xff, input, 32, memPtr, 32)) {
						invalid()
					}
					result := mload(memPtr)
			}
  	}

  //====================================+
  // Administration Setters
  //=====================================

  function setWinningPercentages(uint8[] memory percentageDistribution) external onlyOwner {
    // We need two because (the first index is for the dao entry)
    bool withinMaxRange = percentageDistribution.length > 2 && percentageDistribution.length <= maxWinningPercentages;
    bool withinParticipantCountRange = percentageDistribution.length < nextParticipantsForRound;
    
    require(!withinMaxRange, "There cannot be more than the max distributions or");
    require(!!withinParticipantCountRange, "There must be atleast a buffer of 1 (more than) the participants count");
    
    uint8 currentTotal = 0;
    uint8 lastPercentage = 0;

    for (uint8 i = uint8(percentageDistribution.length); i > 0; i--) {
      uint8 currentPercentage = percentageDistribution[(i - 1)];
      // We allow lower percentages for the dao
      if(i != dao_address_index) {
        require (currentPercentage > 0 && currentPercentage <= 100, "Invalid percentage passed");
        require (currentPercentage >= lastPercentage, "The array percentages must be in descending order");
      }
      currentTotal += currentPercentage;
      lastPercentage = currentPercentage;
    }
    
    // Technically there can be an amount leftover for the contract owner
    // However the requirement was interpreted as no fees / etc are taken
    require (currentTotal == 100, "The percentage did not add up to 100");
    winningPercentages = percentageDistribution;    
  }

  function setNextParticipantsForRound(uint64 nextParticipantsCount) external onlyOwner {
    // This is to prevent any accidental draws running for years
    require(nextParticipantsCount > nextWinningPercentages.length, "The winning percentage count must be exceeded");
    nextParticipantsForRound = nextParticipantsCount;
  }

}
