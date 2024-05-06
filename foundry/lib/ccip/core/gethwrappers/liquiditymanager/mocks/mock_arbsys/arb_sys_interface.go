// Code generated by mockery v2.38.0. DO NOT EDIT.

package mock_arbsys

import (
	big "math/big"

	arbsys "github.com/smartcontractkit/chainlink/v2/core/gethwrappers/liquiditymanager/generated/arbsys"

	bind "github.com/ethereum/go-ethereum/accounts/abi/bind"

	common "github.com/ethereum/go-ethereum/common"

	event "github.com/ethereum/go-ethereum/event"

	generated "github.com/smartcontractkit/chainlink/v2/core/gethwrappers/generated"

	mock "github.com/stretchr/testify/mock"

	types "github.com/ethereum/go-ethereum/core/types"
)

// ArbSysInterface is an autogenerated mock type for the ArbSysInterface type
type ArbSysInterface struct {
	mock.Mock
}

// Address provides a mock function with given fields:
func (_m *ArbSysInterface) Address() common.Address {
	ret := _m.Called()

	if len(ret) == 0 {
		panic("no return value specified for Address")
	}

	var r0 common.Address
	if rf, ok := ret.Get(0).(func() common.Address); ok {
		r0 = rf()
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(common.Address)
		}
	}

	return r0
}

// ArbBlockHash provides a mock function with given fields: opts, arbBlockNum
func (_m *ArbSysInterface) ArbBlockHash(opts *bind.CallOpts, arbBlockNum *big.Int) ([32]byte, error) {
	ret := _m.Called(opts, arbBlockNum)

	if len(ret) == 0 {
		panic("no return value specified for ArbBlockHash")
	}

	var r0 [32]byte
	var r1 error
	if rf, ok := ret.Get(0).(func(*bind.CallOpts, *big.Int) ([32]byte, error)); ok {
		return rf(opts, arbBlockNum)
	}
	if rf, ok := ret.Get(0).(func(*bind.CallOpts, *big.Int) [32]byte); ok {
		r0 = rf(opts, arbBlockNum)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([32]byte)
		}
	}

	if rf, ok := ret.Get(1).(func(*bind.CallOpts, *big.Int) error); ok {
		r1 = rf(opts, arbBlockNum)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// ArbBlockNumber provides a mock function with given fields: opts
func (_m *ArbSysInterface) ArbBlockNumber(opts *bind.CallOpts) (*big.Int, error) {
	ret := _m.Called(opts)

	if len(ret) == 0 {
		panic("no return value specified for ArbBlockNumber")
	}

	var r0 *big.Int
	var r1 error
	if rf, ok := ret.Get(0).(func(*bind.CallOpts) (*big.Int, error)); ok {
		return rf(opts)
	}
	if rf, ok := ret.Get(0).(func(*bind.CallOpts) *big.Int); ok {
		r0 = rf(opts)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*big.Int)
		}
	}

	if rf, ok := ret.Get(1).(func(*bind.CallOpts) error); ok {
		r1 = rf(opts)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// ArbChainID provides a mock function with given fields: opts
func (_m *ArbSysInterface) ArbChainID(opts *bind.CallOpts) (*big.Int, error) {
	ret := _m.Called(opts)

	if len(ret) == 0 {
		panic("no return value specified for ArbChainID")
	}

	var r0 *big.Int
	var r1 error
	if rf, ok := ret.Get(0).(func(*bind.CallOpts) (*big.Int, error)); ok {
		return rf(opts)
	}
	if rf, ok := ret.Get(0).(func(*bind.CallOpts) *big.Int); ok {
		r0 = rf(opts)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*big.Int)
		}
	}

	if rf, ok := ret.Get(1).(func(*bind.CallOpts) error); ok {
		r1 = rf(opts)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// ArbOSVersion provides a mock function with given fields: opts
func (_m *ArbSysInterface) ArbOSVersion(opts *bind.CallOpts) (*big.Int, error) {
	ret := _m.Called(opts)

	if len(ret) == 0 {
		panic("no return value specified for ArbOSVersion")
	}

	var r0 *big.Int
	var r1 error
	if rf, ok := ret.Get(0).(func(*bind.CallOpts) (*big.Int, error)); ok {
		return rf(opts)
	}
	if rf, ok := ret.Get(0).(func(*bind.CallOpts) *big.Int); ok {
		r0 = rf(opts)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*big.Int)
		}
	}

	if rf, ok := ret.Get(1).(func(*bind.CallOpts) error); ok {
		r1 = rf(opts)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// FilterL2ToL1Transaction provides a mock function with given fields: opts, destination, uniqueId, batchNumber
func (_m *ArbSysInterface) FilterL2ToL1Transaction(opts *bind.FilterOpts, destination []common.Address, uniqueId []*big.Int, batchNumber []*big.Int) (*arbsys.ArbSysL2ToL1TransactionIterator, error) {
	ret := _m.Called(opts, destination, uniqueId, batchNumber)

	if len(ret) == 0 {
		panic("no return value specified for FilterL2ToL1Transaction")
	}

	var r0 *arbsys.ArbSysL2ToL1TransactionIterator
	var r1 error
	if rf, ok := ret.Get(0).(func(*bind.FilterOpts, []common.Address, []*big.Int, []*big.Int) (*arbsys.ArbSysL2ToL1TransactionIterator, error)); ok {
		return rf(opts, destination, uniqueId, batchNumber)
	}
	if rf, ok := ret.Get(0).(func(*bind.FilterOpts, []common.Address, []*big.Int, []*big.Int) *arbsys.ArbSysL2ToL1TransactionIterator); ok {
		r0 = rf(opts, destination, uniqueId, batchNumber)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*arbsys.ArbSysL2ToL1TransactionIterator)
		}
	}

	if rf, ok := ret.Get(1).(func(*bind.FilterOpts, []common.Address, []*big.Int, []*big.Int) error); ok {
		r1 = rf(opts, destination, uniqueId, batchNumber)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// FilterL2ToL1Tx provides a mock function with given fields: opts, destination, hash, position
func (_m *ArbSysInterface) FilterL2ToL1Tx(opts *bind.FilterOpts, destination []common.Address, hash []*big.Int, position []*big.Int) (*arbsys.ArbSysL2ToL1TxIterator, error) {
	ret := _m.Called(opts, destination, hash, position)

	if len(ret) == 0 {
		panic("no return value specified for FilterL2ToL1Tx")
	}

	var r0 *arbsys.ArbSysL2ToL1TxIterator
	var r1 error
	if rf, ok := ret.Get(0).(func(*bind.FilterOpts, []common.Address, []*big.Int, []*big.Int) (*arbsys.ArbSysL2ToL1TxIterator, error)); ok {
		return rf(opts, destination, hash, position)
	}
	if rf, ok := ret.Get(0).(func(*bind.FilterOpts, []common.Address, []*big.Int, []*big.Int) *arbsys.ArbSysL2ToL1TxIterator); ok {
		r0 = rf(opts, destination, hash, position)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*arbsys.ArbSysL2ToL1TxIterator)
		}
	}

	if rf, ok := ret.Get(1).(func(*bind.FilterOpts, []common.Address, []*big.Int, []*big.Int) error); ok {
		r1 = rf(opts, destination, hash, position)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// FilterSendMerkleUpdate provides a mock function with given fields: opts, reserved, hash, position
func (_m *ArbSysInterface) FilterSendMerkleUpdate(opts *bind.FilterOpts, reserved []*big.Int, hash [][32]byte, position []*big.Int) (*arbsys.ArbSysSendMerkleUpdateIterator, error) {
	ret := _m.Called(opts, reserved, hash, position)

	if len(ret) == 0 {
		panic("no return value specified for FilterSendMerkleUpdate")
	}

	var r0 *arbsys.ArbSysSendMerkleUpdateIterator
	var r1 error
	if rf, ok := ret.Get(0).(func(*bind.FilterOpts, []*big.Int, [][32]byte, []*big.Int) (*arbsys.ArbSysSendMerkleUpdateIterator, error)); ok {
		return rf(opts, reserved, hash, position)
	}
	if rf, ok := ret.Get(0).(func(*bind.FilterOpts, []*big.Int, [][32]byte, []*big.Int) *arbsys.ArbSysSendMerkleUpdateIterator); ok {
		r0 = rf(opts, reserved, hash, position)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*arbsys.ArbSysSendMerkleUpdateIterator)
		}
	}

	if rf, ok := ret.Get(1).(func(*bind.FilterOpts, []*big.Int, [][32]byte, []*big.Int) error); ok {
		r1 = rf(opts, reserved, hash, position)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// GetStorageGasAvailable provides a mock function with given fields: opts
func (_m *ArbSysInterface) GetStorageGasAvailable(opts *bind.CallOpts) (*big.Int, error) {
	ret := _m.Called(opts)

	if len(ret) == 0 {
		panic("no return value specified for GetStorageGasAvailable")
	}

	var r0 *big.Int
	var r1 error
	if rf, ok := ret.Get(0).(func(*bind.CallOpts) (*big.Int, error)); ok {
		return rf(opts)
	}
	if rf, ok := ret.Get(0).(func(*bind.CallOpts) *big.Int); ok {
		r0 = rf(opts)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*big.Int)
		}
	}

	if rf, ok := ret.Get(1).(func(*bind.CallOpts) error); ok {
		r1 = rf(opts)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// IsTopLevelCall provides a mock function with given fields: opts
func (_m *ArbSysInterface) IsTopLevelCall(opts *bind.CallOpts) (bool, error) {
	ret := _m.Called(opts)

	if len(ret) == 0 {
		panic("no return value specified for IsTopLevelCall")
	}

	var r0 bool
	var r1 error
	if rf, ok := ret.Get(0).(func(*bind.CallOpts) (bool, error)); ok {
		return rf(opts)
	}
	if rf, ok := ret.Get(0).(func(*bind.CallOpts) bool); ok {
		r0 = rf(opts)
	} else {
		r0 = ret.Get(0).(bool)
	}

	if rf, ok := ret.Get(1).(func(*bind.CallOpts) error); ok {
		r1 = rf(opts)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// MapL1SenderContractAddressToL2Alias provides a mock function with given fields: opts, sender, unused
func (_m *ArbSysInterface) MapL1SenderContractAddressToL2Alias(opts *bind.CallOpts, sender common.Address, unused common.Address) (common.Address, error) {
	ret := _m.Called(opts, sender, unused)

	if len(ret) == 0 {
		panic("no return value specified for MapL1SenderContractAddressToL2Alias")
	}

	var r0 common.Address
	var r1 error
	if rf, ok := ret.Get(0).(func(*bind.CallOpts, common.Address, common.Address) (common.Address, error)); ok {
		return rf(opts, sender, unused)
	}
	if rf, ok := ret.Get(0).(func(*bind.CallOpts, common.Address, common.Address) common.Address); ok {
		r0 = rf(opts, sender, unused)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(common.Address)
		}
	}

	if rf, ok := ret.Get(1).(func(*bind.CallOpts, common.Address, common.Address) error); ok {
		r1 = rf(opts, sender, unused)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// MyCallersAddressWithoutAliasing provides a mock function with given fields: opts
func (_m *ArbSysInterface) MyCallersAddressWithoutAliasing(opts *bind.CallOpts) (common.Address, error) {
	ret := _m.Called(opts)

	if len(ret) == 0 {
		panic("no return value specified for MyCallersAddressWithoutAliasing")
	}

	var r0 common.Address
	var r1 error
	if rf, ok := ret.Get(0).(func(*bind.CallOpts) (common.Address, error)); ok {
		return rf(opts)
	}
	if rf, ok := ret.Get(0).(func(*bind.CallOpts) common.Address); ok {
		r0 = rf(opts)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(common.Address)
		}
	}

	if rf, ok := ret.Get(1).(func(*bind.CallOpts) error); ok {
		r1 = rf(opts)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// ParseL2ToL1Transaction provides a mock function with given fields: log
func (_m *ArbSysInterface) ParseL2ToL1Transaction(log types.Log) (*arbsys.ArbSysL2ToL1Transaction, error) {
	ret := _m.Called(log)

	if len(ret) == 0 {
		panic("no return value specified for ParseL2ToL1Transaction")
	}

	var r0 *arbsys.ArbSysL2ToL1Transaction
	var r1 error
	if rf, ok := ret.Get(0).(func(types.Log) (*arbsys.ArbSysL2ToL1Transaction, error)); ok {
		return rf(log)
	}
	if rf, ok := ret.Get(0).(func(types.Log) *arbsys.ArbSysL2ToL1Transaction); ok {
		r0 = rf(log)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*arbsys.ArbSysL2ToL1Transaction)
		}
	}

	if rf, ok := ret.Get(1).(func(types.Log) error); ok {
		r1 = rf(log)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// ParseL2ToL1Tx provides a mock function with given fields: log
func (_m *ArbSysInterface) ParseL2ToL1Tx(log types.Log) (*arbsys.ArbSysL2ToL1Tx, error) {
	ret := _m.Called(log)

	if len(ret) == 0 {
		panic("no return value specified for ParseL2ToL1Tx")
	}

	var r0 *arbsys.ArbSysL2ToL1Tx
	var r1 error
	if rf, ok := ret.Get(0).(func(types.Log) (*arbsys.ArbSysL2ToL1Tx, error)); ok {
		return rf(log)
	}
	if rf, ok := ret.Get(0).(func(types.Log) *arbsys.ArbSysL2ToL1Tx); ok {
		r0 = rf(log)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*arbsys.ArbSysL2ToL1Tx)
		}
	}

	if rf, ok := ret.Get(1).(func(types.Log) error); ok {
		r1 = rf(log)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// ParseLog provides a mock function with given fields: log
func (_m *ArbSysInterface) ParseLog(log types.Log) (generated.AbigenLog, error) {
	ret := _m.Called(log)

	if len(ret) == 0 {
		panic("no return value specified for ParseLog")
	}

	var r0 generated.AbigenLog
	var r1 error
	if rf, ok := ret.Get(0).(func(types.Log) (generated.AbigenLog, error)); ok {
		return rf(log)
	}
	if rf, ok := ret.Get(0).(func(types.Log) generated.AbigenLog); ok {
		r0 = rf(log)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(generated.AbigenLog)
		}
	}

	if rf, ok := ret.Get(1).(func(types.Log) error); ok {
		r1 = rf(log)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// ParseSendMerkleUpdate provides a mock function with given fields: log
func (_m *ArbSysInterface) ParseSendMerkleUpdate(log types.Log) (*arbsys.ArbSysSendMerkleUpdate, error) {
	ret := _m.Called(log)

	if len(ret) == 0 {
		panic("no return value specified for ParseSendMerkleUpdate")
	}

	var r0 *arbsys.ArbSysSendMerkleUpdate
	var r1 error
	if rf, ok := ret.Get(0).(func(types.Log) (*arbsys.ArbSysSendMerkleUpdate, error)); ok {
		return rf(log)
	}
	if rf, ok := ret.Get(0).(func(types.Log) *arbsys.ArbSysSendMerkleUpdate); ok {
		r0 = rf(log)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*arbsys.ArbSysSendMerkleUpdate)
		}
	}

	if rf, ok := ret.Get(1).(func(types.Log) error); ok {
		r1 = rf(log)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// SendMerkleTreeState provides a mock function with given fields: opts
func (_m *ArbSysInterface) SendMerkleTreeState(opts *bind.CallOpts) (arbsys.SendMerkleTreeState, error) {
	ret := _m.Called(opts)

	if len(ret) == 0 {
		panic("no return value specified for SendMerkleTreeState")
	}

	var r0 arbsys.SendMerkleTreeState
	var r1 error
	if rf, ok := ret.Get(0).(func(*bind.CallOpts) (arbsys.SendMerkleTreeState, error)); ok {
		return rf(opts)
	}
	if rf, ok := ret.Get(0).(func(*bind.CallOpts) arbsys.SendMerkleTreeState); ok {
		r0 = rf(opts)
	} else {
		r0 = ret.Get(0).(arbsys.SendMerkleTreeState)
	}

	if rf, ok := ret.Get(1).(func(*bind.CallOpts) error); ok {
		r1 = rf(opts)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// SendTxToL1 provides a mock function with given fields: opts, destination, data
func (_m *ArbSysInterface) SendTxToL1(opts *bind.TransactOpts, destination common.Address, data []byte) (*types.Transaction, error) {
	ret := _m.Called(opts, destination, data)

	if len(ret) == 0 {
		panic("no return value specified for SendTxToL1")
	}

	var r0 *types.Transaction
	var r1 error
	if rf, ok := ret.Get(0).(func(*bind.TransactOpts, common.Address, []byte) (*types.Transaction, error)); ok {
		return rf(opts, destination, data)
	}
	if rf, ok := ret.Get(0).(func(*bind.TransactOpts, common.Address, []byte) *types.Transaction); ok {
		r0 = rf(opts, destination, data)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*types.Transaction)
		}
	}

	if rf, ok := ret.Get(1).(func(*bind.TransactOpts, common.Address, []byte) error); ok {
		r1 = rf(opts, destination, data)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// WasMyCallersAddressAliased provides a mock function with given fields: opts
func (_m *ArbSysInterface) WasMyCallersAddressAliased(opts *bind.CallOpts) (bool, error) {
	ret := _m.Called(opts)

	if len(ret) == 0 {
		panic("no return value specified for WasMyCallersAddressAliased")
	}

	var r0 bool
	var r1 error
	if rf, ok := ret.Get(0).(func(*bind.CallOpts) (bool, error)); ok {
		return rf(opts)
	}
	if rf, ok := ret.Get(0).(func(*bind.CallOpts) bool); ok {
		r0 = rf(opts)
	} else {
		r0 = ret.Get(0).(bool)
	}

	if rf, ok := ret.Get(1).(func(*bind.CallOpts) error); ok {
		r1 = rf(opts)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// WatchL2ToL1Transaction provides a mock function with given fields: opts, sink, destination, uniqueId, batchNumber
func (_m *ArbSysInterface) WatchL2ToL1Transaction(opts *bind.WatchOpts, sink chan<- *arbsys.ArbSysL2ToL1Transaction, destination []common.Address, uniqueId []*big.Int, batchNumber []*big.Int) (event.Subscription, error) {
	ret := _m.Called(opts, sink, destination, uniqueId, batchNumber)

	if len(ret) == 0 {
		panic("no return value specified for WatchL2ToL1Transaction")
	}

	var r0 event.Subscription
	var r1 error
	if rf, ok := ret.Get(0).(func(*bind.WatchOpts, chan<- *arbsys.ArbSysL2ToL1Transaction, []common.Address, []*big.Int, []*big.Int) (event.Subscription, error)); ok {
		return rf(opts, sink, destination, uniqueId, batchNumber)
	}
	if rf, ok := ret.Get(0).(func(*bind.WatchOpts, chan<- *arbsys.ArbSysL2ToL1Transaction, []common.Address, []*big.Int, []*big.Int) event.Subscription); ok {
		r0 = rf(opts, sink, destination, uniqueId, batchNumber)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(event.Subscription)
		}
	}

	if rf, ok := ret.Get(1).(func(*bind.WatchOpts, chan<- *arbsys.ArbSysL2ToL1Transaction, []common.Address, []*big.Int, []*big.Int) error); ok {
		r1 = rf(opts, sink, destination, uniqueId, batchNumber)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// WatchL2ToL1Tx provides a mock function with given fields: opts, sink, destination, hash, position
func (_m *ArbSysInterface) WatchL2ToL1Tx(opts *bind.WatchOpts, sink chan<- *arbsys.ArbSysL2ToL1Tx, destination []common.Address, hash []*big.Int, position []*big.Int) (event.Subscription, error) {
	ret := _m.Called(opts, sink, destination, hash, position)

	if len(ret) == 0 {
		panic("no return value specified for WatchL2ToL1Tx")
	}

	var r0 event.Subscription
	var r1 error
	if rf, ok := ret.Get(0).(func(*bind.WatchOpts, chan<- *arbsys.ArbSysL2ToL1Tx, []common.Address, []*big.Int, []*big.Int) (event.Subscription, error)); ok {
		return rf(opts, sink, destination, hash, position)
	}
	if rf, ok := ret.Get(0).(func(*bind.WatchOpts, chan<- *arbsys.ArbSysL2ToL1Tx, []common.Address, []*big.Int, []*big.Int) event.Subscription); ok {
		r0 = rf(opts, sink, destination, hash, position)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(event.Subscription)
		}
	}

	if rf, ok := ret.Get(1).(func(*bind.WatchOpts, chan<- *arbsys.ArbSysL2ToL1Tx, []common.Address, []*big.Int, []*big.Int) error); ok {
		r1 = rf(opts, sink, destination, hash, position)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// WatchSendMerkleUpdate provides a mock function with given fields: opts, sink, reserved, hash, position
func (_m *ArbSysInterface) WatchSendMerkleUpdate(opts *bind.WatchOpts, sink chan<- *arbsys.ArbSysSendMerkleUpdate, reserved []*big.Int, hash [][32]byte, position []*big.Int) (event.Subscription, error) {
	ret := _m.Called(opts, sink, reserved, hash, position)

	if len(ret) == 0 {
		panic("no return value specified for WatchSendMerkleUpdate")
	}

	var r0 event.Subscription
	var r1 error
	if rf, ok := ret.Get(0).(func(*bind.WatchOpts, chan<- *arbsys.ArbSysSendMerkleUpdate, []*big.Int, [][32]byte, []*big.Int) (event.Subscription, error)); ok {
		return rf(opts, sink, reserved, hash, position)
	}
	if rf, ok := ret.Get(0).(func(*bind.WatchOpts, chan<- *arbsys.ArbSysSendMerkleUpdate, []*big.Int, [][32]byte, []*big.Int) event.Subscription); ok {
		r0 = rf(opts, sink, reserved, hash, position)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(event.Subscription)
		}
	}

	if rf, ok := ret.Get(1).(func(*bind.WatchOpts, chan<- *arbsys.ArbSysSendMerkleUpdate, []*big.Int, [][32]byte, []*big.Int) error); ok {
		r1 = rf(opts, sink, reserved, hash, position)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// WithdrawEth provides a mock function with given fields: opts, destination
func (_m *ArbSysInterface) WithdrawEth(opts *bind.TransactOpts, destination common.Address) (*types.Transaction, error) {
	ret := _m.Called(opts, destination)

	if len(ret) == 0 {
		panic("no return value specified for WithdrawEth")
	}

	var r0 *types.Transaction
	var r1 error
	if rf, ok := ret.Get(0).(func(*bind.TransactOpts, common.Address) (*types.Transaction, error)); ok {
		return rf(opts, destination)
	}
	if rf, ok := ret.Get(0).(func(*bind.TransactOpts, common.Address) *types.Transaction); ok {
		r0 = rf(opts, destination)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*types.Transaction)
		}
	}

	if rf, ok := ret.Get(1).(func(*bind.TransactOpts, common.Address) error); ok {
		r1 = rf(opts, destination)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// NewArbSysInterface creates a new instance of ArbSysInterface. It also registers a testing interface on the mock and a cleanup function to assert the mocks expectations.
// The first argument is typically a *testing.T value.
func NewArbSysInterface(t interface {
	mock.TestingT
	Cleanup(func())
}) *ArbSysInterface {
	mock := &ArbSysInterface{}
	mock.Mock.Test(t)

	t.Cleanup(func() { mock.AssertExpectations(t) })

	return mock
}
