import { calculateHash } from './crypto.js';
import { MerkleProofNode } from '../types.js';

export class MerkleTree {
  private leaves: any[];
  private tree: string[][] | null;

  constructor(leaves: any[]) {
    this.leaves = leaves;
    this.tree = null;
  }

  async build(): Promise<string | null> {
    const hashedLeaves = await Promise.all(
      this.leaves.map(leaf => calculateHash(leaf))
    );
    
    this.tree = await this.buildTree(hashedLeaves);
    return this.getRoot();
  }

  private async buildTree(leaves: string[]): Promise<string[][]> {
    if (leaves.length === 0) {
      return [];
    }
    
    if (leaves.length === 1) {
      return [leaves];
    }
    
    const tree: string[][] = [leaves];
    let currentLevel = leaves;
    
    while (currentLevel.length > 1) {
      const nextLevel: string[] = [];
      
      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i];
        const right = currentLevel[i + 1] || left;
        const combined = await calculateHash(left + right);
        nextLevel.push(combined);
      }
      
      tree.push(nextLevel);
      currentLevel = nextLevel;
    }
    
    return tree;
  }

  getRoot(): string | null {
    if (!this.tree || this.tree.length === 0) {
      return null;
    }
    return this.tree[this.tree.length - 1][0];
  }

  async getProof(index: number): Promise<MerkleProofNode[] | null> {
    if (!this.tree || index >= this.leaves.length) {
      return null;
    }
    
    const proof: MerkleProofNode[] = [];
    let currentIndex = index;
    
    for (let level = 0; level < this.tree.length - 1; level++) {
      const isRightNode = currentIndex % 2 === 1;
      const siblingIndex = isRightNode ? currentIndex - 1 : currentIndex + 1;
      
      if (siblingIndex < this.tree[level].length) {
        proof.push({
          hash: this.tree[level][siblingIndex],
          position: isRightNode ? 'left' : 'right'
        });
      }
      
      currentIndex = Math.floor(currentIndex / 2);
    }
    
    return proof;
  }

  async verifyProof(leaf: any, proof: MerkleProofNode[], root: string): Promise<boolean> {
    let hash = await calculateHash(leaf);
    
    for (const node of proof) {
      if (node.position === 'left') {
        hash = await calculateHash(node.hash + hash);
      } else {
        hash = await calculateHash(hash + node.hash);
      }
    }
    
    return hash === root;
  }
}

export async function createBatchMerkleRoot(productIds: string[]): Promise<string | null> {
  const tree = new MerkleTree(productIds);
  return await tree.build();
}

export async function verifyProductInBatch(
  productId: string, 
  proof: MerkleProofNode[], 
  merkleRoot: string
): Promise<boolean> {
  const tree = new MerkleTree([]);
  return await tree.verifyProof(productId, proof, merkleRoot);
}
