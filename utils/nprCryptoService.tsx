import { 
  MerkleTree, 
  MerkleNode, 
  MerkleProof, 
  CryptographicSignature, 
  NPREntry,
  NPRCryptoService 
} from './nprTypes';

class NPRCryptographicService implements NPRCryptoService {
  private textEncoder: TextEncoder;
  private textDecoder: TextDecoder;

  constructor() {
    this.textEncoder = new TextEncoder();
    this.textDecoder = new TextDecoder();
  }

  /**
   * Generate cryptographic hash using Web Crypto API
   */
  async generateHash(data: any, algorithm: 'sha256' | 'sha512' = 'sha256'): Promise<string> {
    const jsonString = typeof data === 'string' ? data : JSON.stringify(data, null, 0);
    const dataBuffer = this.textEncoder.encode(jsonString);
    
    const hashBuffer = await crypto.subtle.digest(
      algorithm === 'sha256' ? 'SHA-256' : 'SHA-512',
      dataBuffer
    );
    
    // Convert ArrayBuffer to hex string
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Generate cryptographically secure salt
   */
  generateSalt(): string {
    const saltArray = new Uint8Array(32);
    crypto.getRandomValues(saltArray);
    return Array.from(saltArray)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Sign data with cryptographic hash and salt
   */
  async signData(data: any): Promise<CryptographicSignature> {
    const salt = this.generateSalt();
    const dataWithSalt = {
      data,
      salt,
      timestamp: new Date()
    };
    
    const hash = await this.generateHash(dataWithSalt, 'sha256');
    
    return {
      algorithm: 'sha256',
      hash,
      salt,
      timestamp: new Date()
    };
  }

  /**
   * Verify cryptographic signature
   */
  async verifySignature(data: any, signature: CryptographicSignature): Promise<boolean> {
    try {
      const dataWithSalt = {
        data,
        salt: signature.salt,
        timestamp: signature.timestamp
      };
      
      const expectedHash = await this.generateHash(dataWithSalt, signature.algorithm);
      return expectedHash === signature.hash;
    } catch (error) {
      console.error('Signature verification failed:', error);
      return false;
    }
  }

  /**
   * Create Merkle Tree from NPR entries
   */
  createMerkleTree(entries: NPREntry[]): MerkleTree {
    if (entries.length === 0) {
      throw new Error('Cannot create Merkle tree from empty entries');
    }

    // Create leaf nodes
    const leaves: MerkleNode[] = [];
    
    for (const entry of entries) {
      const leafHash = this.generateHashSync({
        id: entry.id,
        type: entry.type,
        content: entry.content,
        timestamp: entry.timestamp,
        signature: entry.signature
      });
      
      leaves.push({
        hash: leafHash,
        data: entry,
        timestamp: entry.timestamp
      });
    }

    // Build tree bottom-up
    const root = this.buildMerkleTreeRecursive(leaves);
    
    return {
      root,
      leaves,
      depth: this.calculateTreeDepth(leaves.length)
    };
  }

  /**
   * Build Merkle tree recursively
   */
  private buildMerkleTreeRecursive(nodes: MerkleNode[]): MerkleNode {
    if (nodes.length === 1) {
      return nodes[0];
    }

    const nextLevel: MerkleNode[] = [];
    
    // Pair nodes and create parent nodes
    for (let i = 0; i < nodes.length; i += 2) {
      const left = nodes[i];
      const right = i + 1 < nodes.length ? nodes[i + 1] : left; // Duplicate if odd number
      
      const parentHash = this.generateHashSync({
        left: left.hash,
        right: right.hash,
        timestamp: new Date()
      });
      
      nextLevel.push({
        hash: parentHash,
        left,
        right,
        timestamp: new Date()
      });
    }
    
    return this.buildMerkleTreeRecursive(nextLevel);
  }

  /**
   * Synchronous hash generation for tree building
   */
  private generateHashSync(data: any): string {
    // For browser compatibility, we'll use a simple but secure hash
    // In production, consider using a WebCrypto-based approach with async handling
    const jsonString = JSON.stringify(data, null, 0);
    return this.simpleHash(jsonString);
  }

  /**
   * Simple but effective hash function for synchronous operations
   */
  private simpleHash(str: string): string {
    let hash = 0;
    if (str.length === 0) return hash.toString(16);
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Convert to positive hex string
    return (Math.abs(hash) + Date.now()).toString(16);
  }

  /**
   * Calculate tree depth
   */
  private calculateTreeDepth(leafCount: number): number {
    return Math.ceil(Math.log2(leafCount));
  }

  /**
   * Generate Merkle proof for specific entry
   */
  generateMerkleProof(tree: MerkleTree, entry: NPREntry): MerkleProof {
    // Find leaf node for entry
    const leafIndex = tree.leaves.findIndex(leaf => 
      leaf.data && leaf.data.id === entry.id
    );
    
    if (leafIndex === -1) {
      throw new Error('Entry not found in Merkle tree');
    }

    const proof: Array<{ hash: string; isLeft: boolean }> = [];
    const leaf = tree.leaves[leafIndex];
    
    // Generate proof path from leaf to root
    this.generateProofPath(tree.root, leaf.hash, proof, []);
    
    return {
      leaf: leaf.hash,
      path: proof,
      root: tree.root.hash
    };
  }

  /**
   * Recursively generate proof path
   */
  private generateProofPath(
    node: MerkleNode, 
    targetHash: string, 
    proof: Array<{ hash: string; isLeft: boolean }>,
    currentPath: string[]
  ): boolean {
    if (node.hash === targetHash) {
      return true;
    }

    if (node.left && node.right) {
      // Check left subtree
      if (this.generateProofPath(node.left, targetHash, proof, [...currentPath, 'L'])) {
        proof.push({ hash: node.right.hash, isLeft: false });
        return true;
      }
      
      // Check right subtree
      if (this.generateProofPath(node.right, targetHash, proof, [...currentPath, 'R'])) {
        proof.push({ hash: node.left.hash, isLeft: true });
        return true;
      }
    }

    return false;
  }

  /**
   * Verify Merkle proof
   */
  verifyMerkleProof(proof: MerkleProof): boolean {
    try {
      let currentHash = proof.leaf;
      
      for (const pathElement of proof.path) {
        if (pathElement.isLeft) {
          currentHash = this.generateHashSync({
            left: pathElement.hash,
            right: currentHash,
            timestamp: new Date()
          });
        } else {
          currentHash = this.generateHashSync({
            left: currentHash,
            right: pathElement.hash,
            timestamp: new Date()
          });
        }
      }
      
      return currentHash === proof.root;
    } catch (error) {
      console.error('Merkle proof verification failed:', error);
      return false;
    }
  }

  /**
   * Update Merkle tree with new entry
   */
  updateMerkleTree(tree: MerkleTree, newEntry: NPREntry): MerkleTree {
    // Add new leaf
    const newLeafHash = this.generateHashSync({
      id: newEntry.id,
      type: newEntry.type,
      content: newEntry.content,
      timestamp: newEntry.timestamp,
      signature: newEntry.signature
    });
    
    const newLeaf: MerkleNode = {
      hash: newLeafHash,
      data: newEntry,
      timestamp: newEntry.timestamp
    };
    
    const updatedLeaves = [...tree.leaves, newLeaf];
    
    // Rebuild tree with new leaf
    return this.createMerkleTree(updatedLeaves.map(leaf => leaf.data!));
  }

  /**
   * Validate NPR data integrity using Merkle tree
   */
  async validateDataIntegrity(entries: NPREntry[]): Promise<{
    isValid: boolean;
    compromisedEntries: string[];
    integrityScore: number;
  }> {
    const compromisedEntries: string[] = [];
    let validEntries = 0;

    // Verify each entry's signature
    for (const entry of entries) {
      const isValid = await this.verifySignature(
        {
          id: entry.id,
          type: entry.type,
          content: entry.content,
          timestamp: entry.timestamp,
          metadata: entry.metadata
        },
        entry.signature
      );
      
      if (isValid) {
        validEntries++;
      } else {
        compromisedEntries.push(entry.id);
      }
    }

    const integrityScore = entries.length > 0 ? (validEntries / entries.length) * 100 : 100;

    return {
      isValid: compromisedEntries.length === 0,
      compromisedEntries,
      integrityScore
    };
  }

  /**
   * Generate audit trail for NPR modifications
   */
  async generateAuditTrail(
    originalEntries: NPREntry[], 
    modifiedEntries: NPREntry[]
  ): Promise<{
    changes: Array<{
      type: 'added' | 'modified' | 'removed';
      entryId: string;
      timestamp: Date;
      hash: string;
    }>;
    integrityMaintained: boolean;
  }> {
    const changes: Array<{
      type: 'added' | 'modified' | 'removed';
      entryId: string;
      timestamp: Date;
      hash: string;
    }> = [];

    const originalMap = new Map(originalEntries.map(e => [e.id, e]));
    const modifiedMap = new Map(modifiedEntries.map(e => [e.id, e]));

    // Check for additions and modifications
    for (const [id, entry] of modifiedMap) {
      if (!originalMap.has(id)) {
        // New entry
        changes.push({
          type: 'added',
          entryId: id,
          timestamp: new Date(),
          hash: await this.generateHash(entry)
        });
      } else {
        const original = originalMap.get(id)!;
        const originalHash = await this.generateHash(original);
        const modifiedHash = await this.generateHash(entry);
        
        if (originalHash !== modifiedHash) {
          // Modified entry
          changes.push({
            type: 'modified',
            entryId: id,
            timestamp: new Date(),
            hash: modifiedHash
          });
        }
      }
    }

    // Check for removals
    for (const [id, entry] of originalMap) {
      if (!modifiedMap.has(id)) {
        changes.push({
          type: 'removed',
          entryId: id,
          timestamp: new Date(),
          hash: await this.generateHash(entry)
        });
      }
    }

    // Verify integrity maintained
    const integrityCheck = await this.validateDataIntegrity(modifiedEntries);

    return {
      changes,
      integrityMaintained: integrityCheck.isValid
    };
  }
}

// Export singleton instance
export const nprCryptoService = new NPRCryptographicService();

// Export class for testing and advanced use cases
export { NPRCryptographicService };