package txmgr

import (
	"time"

	gethcommon "github.com/ethereum/go-ethereum/common"

	"github.com/smartcontractkit/chainlink/v2/common/config"
	txmgrtypes "github.com/smartcontractkit/chainlink/v2/common/txmgr/types"
	"github.com/smartcontractkit/chainlink/v2/core/chains/evm/assets"
)

// ChainConfig encompasses config used by txmgr package
// Unless otherwise specified, these should support changing at runtime
//
//go:generate mockery --quiet --recursive --name ChainConfig --output ./mocks/ --case=underscore --structname Config --filename config.go
type ChainConfig interface {
	ChainType() config.ChainType
	FinalityDepth() uint32
	FinalityTagEnabled() bool
	NonceAutoSync() bool
	RPCDefaultBatchSize() uint32
}

type FeeConfig interface {
	EIP1559DynamicFees() bool
	BumpPercent() uint16
	BumpThreshold() uint64
	BumpTxDepth() uint32
	LimitDefault() uint64
	PriceDefault() *assets.Wei
	TipCapMin() *assets.Wei
	PriceMax() *assets.Wei
	PriceMin() *assets.Wei
	PriceMaxKey(gethcommon.Address) *assets.Wei
}

type DatabaseConfig interface {
	DefaultQueryTimeout() time.Duration
	LogSQL() bool
}

type ListenerConfig interface {
	FallbackPollInterval() time.Duration
}

type (
	EvmTxmConfig         txmgrtypes.TransactionManagerChainConfig
	EvmTxmFeeConfig      txmgrtypes.TransactionManagerFeeConfig
	EvmBroadcasterConfig txmgrtypes.BroadcasterChainConfig
	EvmConfirmerConfig   txmgrtypes.ConfirmerChainConfig
	EvmResenderConfig    txmgrtypes.ResenderChainConfig
	EvmReaperConfig      txmgrtypes.ReaperChainConfig
)

var _ EvmTxmConfig = (*evmTxmConfig)(nil)

type evmTxmConfig struct {
	ChainConfig
}

func NewEvmTxmConfig(c ChainConfig) *evmTxmConfig {
	return &evmTxmConfig{c}
}

func (c evmTxmConfig) IsL2() bool { return c.ChainType().IsL2() }

var _ EvmTxmFeeConfig = (*evmTxmFeeConfig)(nil)

type evmTxmFeeConfig struct {
	FeeConfig
}

func NewEvmTxmFeeConfig(c FeeConfig) *evmTxmFeeConfig {
	return &evmTxmFeeConfig{c}
}

func (c evmTxmFeeConfig) MaxFeePrice() string { return c.PriceMax().String() }

func (c evmTxmFeeConfig) FeePriceDefault() string { return c.PriceDefault().String() }
