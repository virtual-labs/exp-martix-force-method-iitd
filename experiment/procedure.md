### Procedure
#### Step 1: Identify the Redundant Forces
For a statically indeterminate structure, the number of redundant (forces or moments that are unknown) must be identified. These are the forces or moments that, if removed, would make the structure statically determinate.

The degree of indeterminacy (D) is given by:  <strong>D=R−3N </strong>

Where: <strong>R</strong> is the number of reaction components, <strong>N</strong> is the number of joints in a two-dimensional structure (for a 3D structure, this formula would differ slightly).

#### Step 3: Apply Compatibility Conditions (𝜽𝟏= 𝜽𝟐)
For each redundant force that was removed, there must be a corresponding displacement in the determinate structure. These displacements must be compatible with the actual boundary conditions of the structure.

The compatibility equations are derived by imposing the condition that the total deformation (including both the primary structure's deformation and that due to the redundants) must sum to zero at specific points where redundants were removed.

<strong>Note:</strong> In case of determinate structures selection of redundant and formation of compatibility equations is not needed only equilibrium conditions are sufficient.

#### Step 4: Calculate Displacements in the Primary Structure
Using classical methods (e.g., virtual work, unit load method, or matrix methods), calculate the displacements at the locations where the redundants were removed. These displacements are the result of applying the external loads to the primary structure.
#### Step 5: Formulate Flexibility Matrix
The flexibility matrix <strong>F<sup>m</sup></strong> relates the unknown redundant forces to the displacements at the points of release. For a structure with D redundants, the flexibility matrix is a D×D

image

Each element F<sup>m</sup><sub>ij</sub> in the matrix represents the displacement at location i due to a unit load applied at location j in the primary determinate structure and m is the member number. The flexibility matrix is symmetric for linear elastic materials.
image

Where: • <strong> &Delta; <sub>ij</sub></strong> is the displacement at point ij,

• <strong>F<sup>m</sup><sub>ij</sub></strong> is the flexibility coefficient (displacement at i due to a unit force at j),

• <strong>X<sub>i</sub></strong> is the redundant force at location j.

<strong>Note:</strong>To derive the first column of <strong>F<sup>m</sup></strong> apply a unit force along of action of first designated force then the displacements along the line of the various forces will be equal to the first column of the flexibility matrix.

#### Step 7:</strong> Force transformation relationship
<strong>{F} = [b] {P}</strong>

This is the mathematical relationship between external forces <strong>{P}</strong> and the internal forces <strong>{F}</strong> where external forces are the main governing forces.

##### Step 8: Formation of total structural flexibility matrix
<strong>[F]<sub>TS</sub> = [b]<sub>T</sub> [F]<sub>c</sub> [b]</strong>

image

#### Step 9: Obtain the external displacement vector
<strong>{u} = [F]TS {p}</strong>

#### Step 10: Determination of the final forces
the reactions, internal forces, and moments can be computed using the principle of
superposition. The final forces and displacements in the structure are a combination of
those from the primary structure and those due to the redundants.

